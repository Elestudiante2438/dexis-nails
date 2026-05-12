import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// GET - Generar reportes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'reservas';
    const formato = searchParams.get('formato') || 'json';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    let data: unknown[] = [];
    let filename = '';

    switch (tipo) {
      case 'reservas':
        data = await db.reserva.findMany({
          where: fechaInicio && fechaFin ? {
            fecha: { gte: fechaInicio, lte: fechaFin }
          } : undefined,
          include: {
            cliente: true,
            servicio: true,
            profesional: true
          },
          orderBy: { fecha: 'desc' },
          take: 500
        });
        filename = 'reporte_reservas';
        break;

      case 'clientes':
        data = await db.cliente.findMany({
          include: {
            _count: { select: { reservas: true, compras: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 500
        });
        filename = 'reporte_clientes';
        break;

      case 'ventas':
        const compras = await db.compra.findMany({
          include: { cliente: true },
          orderBy: { fecha: 'desc' },
          take: 500
        });
        data = compras;
        filename = 'reporte_ventas';
        break;

      case 'comisiones':
        data = await db.comision.findMany({
          include: {
            profesional: true
          },
          orderBy: { fecha: 'desc' },
          take: 500
        });
        filename = 'reporte_comisiones';
        break;

      case 'inventario':
        data = await db.producto.findMany({
          include: {
            categoria: true
          },
          orderBy: { nombre: 'asc' }
        });
        filename = 'reporte_inventario';
        break;

      case 'financiero':
        // Resumen financiero
        const [reservas, comprasData, comisiones] = await Promise.all([
          db.reserva.aggregate({
            _sum: { precioFinal: true },
            _count: true,
            where: { estado: 'COMPLETADA' }
          }),
          db.compra.aggregate({
            _sum: { total: true },
            _count: true
          }),
          db.comision.aggregate({
            _sum: { montoComision: true },
            _where: { estado: 'PAGADA' }
          })
        ]);
        data = [{
          totalReservas: reservas._count,
          ingresosReservas: reservas._sum.precioFinal || 0,
          totalVentas: comprasData._count,
          ingresosVentas: comprasData._sum.total || 0,
          comisionesPagadas: comisiones._sum.montoComision || 0,
          ingresosTotal: (reservas._sum.precioFinal || 0) + (comprasData._sum.total || 0)
        }];
        filename = 'reporte_financiero';
        break;

      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 });
    }

    // Si es JSON, devolver directamente
    if (formato === 'json') {
      return NextResponse.json({ data, tipo, total: data.length });
    }

    // Si es Excel o PDF, generar archivo
    if (formato === 'excel' || formato === 'pdf') {
      const timestamp = Date.now();
      const tempFile = path.join('/tmp', `${filename}_${timestamp}.${formato === 'excel' ? 'xlsx' : 'pdf'}`);

      // Crear script Python para generar el archivo
      const pythonScript = generarScriptPython(tipo, formato, data, tempFile);
      const scriptPath = path.join('/tmp', `script_${timestamp}.py`);
      writeFileSync(scriptPath, pythonScript);

      try {
        await execAsync(`python3 ${scriptPath}`);
        
        // Leer archivo y devolver
        const fileData = readFileSync(tempFile);
        
        // Limpiar archivos temporales
        unlinkSync(scriptPath);
        unlinkSync(tempFile);

        return new NextResponse(fileData, {
          headers: {
            'Content-Type': formato === 'excel' 
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}.${formato === 'excel' ? 'xlsx' : 'pdf'}"`
          }
        });
      } catch (error) {
        console.error('Error generando archivo:', error);
        return NextResponse.json({ error: 'Error generando archivo' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Formato no válido' }, { status: 400 });
  } catch (error) {
    console.error('Error en reportes:', error);
    return NextResponse.json({ error: 'Error generando reporte' }, { status: 500 });
  }
}

function generarScriptPython(tipo: string, formato: string, data: unknown[], filepath: string): string {
  if (formato === 'excel') {
    return `
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils.dataframe import dataframe_to_rows

data = ${JSON.stringify(data)}
filepath = "${filepath}"

wb = Workbook()
ws = wb.active
ws.title = "Reporte"

# Estilos
header_font = Font(bold=True, color="FFFFFF", name="Times New Roman", size=11)
header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
cell_font = Font(name="Times New Roman", size=10)
border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)

# Si hay datos, crear tabla
if data:
    df = pd.DataFrame(data)
    
    # Escribir datos
    for r_idx, row in enumerate(dataframe_to_rows(df, index=False, header=True), 1):
        for c_idx, value in enumerate(row, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=value)
            cell.border = border
            cell.font = header_font if r_idx == 1 else cell_font
            if r_idx == 1:
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal='center')

    # Ajustar anchos
    for column in ws.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = min(max_length + 2, 50)
        ws.column_dimensions[column_letter].width = adjusted_width

wb.save(filepath)
print(f"Archivo guardado: {filepath}")
`;
  } else {
    // PDF
    return `
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import json

data = ${JSON.stringify(data)}
filepath = "${filepath}"
tipo = "${tipo}"

doc = SimpleDocTemplate(filepath, pagesize=letter, 
                        title="Reporte Dexi's Nails",
                        author="Z.ai",
                        creator="Z.ai")
styles = getSampleStyleSheet()
story = []

# Título
title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, spaceAfter=20)
story.append(Paragraph(f"Reporte de {tipo.replace('_', ' ').title()}", title_style))
story.append(Spacer(1, 20))

if data:
    # Obtener columnas
    if isinstance(data[0], dict):
        columns = list(data[0].keys())
        
        # Filtrar columnas complejas
        simple_columns = []
        for col in columns:
            if col.startswith('_') or col in ['createdAt', 'updatedAt']:
                continue
            val = data[0].get(col)
            if not isinstance(val, (dict, list)):
                simple_columns.append(col)
        
        # Crear tabla
        table_data = [[Paragraph(f"<b>{col}</b>", styles['Normal']) for col in simple_columns[:6]]]
        
        for item in data[:50]:  # Limitar a 50 filas
            row = []
            for col in simple_columns[:6]:
                val = item.get(col, '')
                if val is None:
                    val = '-'
                elif isinstance(val, bool):
                    val = 'Sí' if val else 'No'
                else:
                    val = str(val)[:30]
                row.append(Paragraph(val, styles['Normal']))
            table_data.append(row)
        
        if len(table_data) > 1:
            t = Table(table_data, colWidths=[1.1*inch]*len(simple_columns[:6]))
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')])
            ]))
            story.append(t)
else:
    story.append(Paragraph("No hay datos para mostrar", styles['Normal']))

doc.build(story)
print(f"PDF generado: {filepath}")
`;
  }
}
