import { useState } from 'react'
import {
  Box, Paper, Typography, ToggleButton, ToggleButtonGroup, Table, TableBody,
  TableCell, TableHead, TableRow
} from '@mui/material'
import { BarChart as ChartIcon, TableChart as TableIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList, Cell
} from 'recharts'

/**
 * Chart colors are the validated data-viz slots, stepped per mode against this
 * app's real chart surfaces (light #FFFFFF / dark #0F2740) — not an automatic
 * flip of the light values. Chrome (grid, axis ink) comes from the MUI theme so
 * it stays one recessive step off whatever surface the card renders on.
 */
const useVizColors = () => {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'
  return {
    series1: dark ? '#3987e5' : '#2a78d6', // slot 1 — every single-series chart
    series2: dark ? '#d95926' : '#eb6834', // slot 2 — "Draft" only
    grid: theme.palette.divider,
    axis: theme.palette.text.secondary,
    ink: theme.palette.text.primary,
    surface: theme.palette.background.paper
  }
}

const nf = (n) => Number(n || 0).toLocaleString('id-ID')
const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || '')

/** 4px rounded data-end, square at the baseline. */
const roundedTop = [4, 4, 0, 0]
const roundedRight = [0, 4, 4, 0]

/** Tooltip in text tokens on the card surface — never in the series color. */
const VizTooltip = ({ active, payload, label, rows }) => {
  const theme = useTheme()
  if (!active || !payload?.length) return null
  const lines = rows ? rows(payload[0].payload) : payload.map((p) => [p.name, nf(p.value)])
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        px: 1.5, py: 1,
        boxShadow: theme.shadows[3],
        maxWidth: 320
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{label}</Typography>
      {lines.map(([k, v]) => (
        <Typography key={k} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          {k}: <strong style={{ color: theme.palette.text.primary }}>{v}</strong>
        </Typography>
      ))}
    </Box>
  )
}

/**
 * One chart card. Every chart ships a table-view twin so no value is reachable
 * only by hovering a colored mark.
 */
const ChartPanel = ({ title, subtitle, empty, columns, rows, height, children }) => {
  const [view, setView] = useState('chart')
  const isEmpty = !rows || rows.length === 0

  return (
    <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
          )}
        </Box>
        <ToggleButtonGroup
          size="small" exclusive value={view}
          onChange={(e, v) => v && setView(v)}
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="chart" aria-label="Tampilan grafik" sx={{ px: 1 }}>
            <ChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="table" aria-label="Tampilan tabel" sx={{ px: 1 }}>
            <TableIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isEmpty ? (
        <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">{empty}</Typography>
        </Box>
      ) : view === 'chart' ? (
        children
      ) : (
        <Box sx={{ maxHeight: height, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align || 'left'} sx={{ fontWeight: 700 }}>{c.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      align={c.align || 'left'}
                      sx={c.align === 'right' ? { fontVariantNumeric: 'tabular-nums' } : undefined}
                    >
                      {c.render ? c.render(r) : r[c.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  )
}

const axisProps = (c) => ({
  stroke: c.grid,
  tick: { fill: c.axis, fontSize: 11 },
  tickLine: false
})

/** Horizontal bar chart — one series, one color, value direct-labelled at the tip. */
const HorizontalBars = ({ data, dataKey, labelKey, colors, tooltipRows, unit }) => {
  const height = Math.max(180, data.length * 34 + 24)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={colors.grid} strokeDasharray="0" horizontal={false} />
        <XAxis type="number" {...axisProps(colors)} allowDecimals={false} />
        <YAxis
          type="category" dataKey={labelKey} width={168} {...axisProps(colors)}
          tickFormatter={(v) => truncate(v, 24)}
        />
        <Tooltip
          cursor={{ fill: colors.grid, fillOpacity: 0.35 }}
          content={<VizTooltip rows={tooltipRows} />}
        />
        <Bar dataKey={dataKey} fill={colors.series1} radius={roundedRight} barSize={16} name={unit} isAnimationActive={false}>
          <LabelList
            dataKey={dataKey} position="right"
            style={{ fill: colors.axis, fontSize: 11 }}
            formatter={nf}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const LaporanBeritaCharts = ({ grafik, loading }) => {
  const c = useVizColors()
  const tren = grafik?.tren || []
  const top = grafik?.top_berita || []
  const kategori = grafik?.kategori || []
  const penulis = grafik?.penulis || []

  const totalKategori = kategori.reduce((a, r) => a + r.jumlah, 0)
  const share = (n) => (totalKategori ? `${Math.round((n / totalKategori) * 1000) / 10}%` : '0%')

  return (
    // Hold the previous render at reduced opacity on refetch — no skeleton flash.
    <Box sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        {/* 1 — Release trend. Two series, so a legend is always present. */}
        <Box sx={{ gridColumn: { lg: '1 / -1' } }}>
          <ChartPanel
            title="Tren Rilis Berita per Bulan"
            subtitle="Jumlah berita dirilis, dipisah menurut status"
            empty="Belum ada berita pada periode ini."
            height={280}
            rows={tren}
            columns={[
              { key: 'label', label: 'Bulan' },
              { key: 'terbit', label: 'Terbit', align: 'right', render: (r) => nf(r.terbit) },
              { key: 'draft', label: 'Draft', align: 'right', render: (r) => nf(r.draft) },
              { key: 'total', label: 'Total', align: 'right', render: (r) => nf(r.total) }
            ]}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tren} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={c.grid} strokeDasharray="0" vertical={false} />
                <XAxis dataKey="label" {...axisProps(c)} />
                <YAxis {...axisProps(c)} allowDecimals={false} width={36} />
                <Tooltip
                  cursor={{ fill: c.grid, fillOpacity: 0.35 }}
                  content={(
                    <VizTooltip rows={(p) => [['Terbit', nf(p.terbit)], ['Draft', nf(p.draft)], ['Total', nf(p.total)]]} />
                  )}
                />
                <Legend
                  iconType="square" iconSize={10}
                  wrapperStyle={{ fontSize: 12, color: c.axis, paddingTop: 8 }}
                />
                {/* Stacked: the 2px stroke is the surface gap between segments. */}
                <Bar
                  dataKey="terbit" name="Terbit" stackId="s" fill={c.series1}
                  barSize={24} stroke={c.surface} strokeWidth={2} isAnimationActive={false}
                >
                  {tren.map((row, i) => (
                    <Cell key={i} radius={row.draft === 0 ? roundedTop : 0} />
                  ))}
                </Bar>
                <Bar
                  dataKey="draft" name="Draft" stackId="s" fill={c.series2}
                  barSize={24} stroke={c.surface} strokeWidth={2} radius={roundedTop}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Box>

        {/* 2 — Most viewed. Single series: no legend box, the title names it. */}
        <ChartPanel
          title="10 Berita Terpopuler"
          subtitle="Berdasarkan jumlah view"
          empty="Belum ada berita pada periode ini."
          height={380}
          rows={top}
          columns={[
            { key: 'judul', label: 'Judul' },
            { key: 'views', label: 'View', align: 'right', render: (r) => nf(r.views) }
          ]}
        >
          <HorizontalBars
            data={top} dataKey="views" labelKey="judul" colors={c} unit="View"
            tooltipRows={(p) => [['Judul', p.judul], ['View', nf(p.views)]]}
          />
        </ChartPanel>

        {/* 3 — Category distribution. */}
        <ChartPanel
          title="Distribusi per Kategori"
          subtitle="Jumlah berita per kategori"
          empty="Belum ada berita pada periode ini."
          height={380}
          rows={kategori}
          columns={[
            { key: 'nama', label: 'Kategori' },
            { key: 'jumlah', label: 'Berita', align: 'right', render: (r) => nf(r.jumlah) },
            { key: 'share', label: 'Porsi', align: 'right', render: (r) => share(r.jumlah) },
            { key: 'views', label: 'View', align: 'right', render: (r) => nf(r.views) }
          ]}
        >
          <HorizontalBars
            data={kategori} dataKey="jumlah" labelKey="nama" colors={c} unit="Berita"
            tooltipRows={(p) => [['Berita', nf(p.jumlah)], ['Porsi', share(p.jumlah)], ['Total view', nf(p.views)]]}
          />
        </ChartPanel>

        {/* 4 — Author contribution. */}
        <Box sx={{ gridColumn: { lg: '1 / -1' } }}>
          <ChartPanel
            title="Kontribusi per Penulis"
            subtitle="Jumlah berita per penulis"
            empty="Belum ada berita pada periode ini."
            height={380}
            rows={penulis}
            columns={[
              { key: 'nama', label: 'Penulis' },
              { key: 'jumlah', label: 'Berita', align: 'right', render: (r) => nf(r.jumlah) },
              { key: 'views', label: 'View', align: 'right', render: (r) => nf(r.views) }
            ]}
          >
            <HorizontalBars
              data={penulis} dataKey="jumlah" labelKey="nama" colors={c} unit="Berita"
              tooltipRows={(p) => [['Berita', nf(p.jumlah)], ['Total view', nf(p.views)]]}
            />
          </ChartPanel>
        </Box>
      </Box>
    </Box>
  )
}

export default LaporanBeritaCharts
