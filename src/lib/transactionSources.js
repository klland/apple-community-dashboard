const DRAFT_PREFIX = '[出售貼文草稿]'

export const TRANSACTION_SOURCE_LABELS = {
  report: '成交回報',
  listing: '外部刊登',
  draft: '貼文草稿',
  unknown: '未分類',
}

export function formatDraftNote(note) {
  return note ? `${DRAFT_PREFIX}\n${note}` : DRAFT_PREFIX
}

export function getTransactionSource(row) {
  if (row.source === 'report') return 'report'
  if (row.source !== 'post') return 'unknown'
  const note = row.note || ''
  if (note.startsWith(DRAFT_PREFIX)) return 'draft'
  if (/^\[(?:社團|Marketplace)刊登匯入[／\]]/.test(note)) return 'listing'
  return 'unknown'
}
