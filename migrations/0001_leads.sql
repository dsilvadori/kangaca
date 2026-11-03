-- Pedidos de orçamento enviados pelo formulário de eventos.
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data_evento TEXT NOT NULL,
  convidados INTEGER NOT NULL,
  local TEXT NOT NULL,
  observacoes TEXT,
  -- novo, orcado, fechado ou perdido
  status TEXT NOT NULL DEFAULT 'novo',
  valor_fechado REAL,
  notas TEXT,
  atualizado_em TEXT,
  fechado_em TEXT,
  pagina TEXT,
  gclid TEXT,
  gbraid TEXT,
  wbraid TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  ip_hash TEXT
);

CREATE INDEX leads_criado_em ON leads (criado_em);
CREATE INDEX leads_status ON leads (status);
CREATE INDEX leads_ip_hash ON leads (ip_hash, criado_em);
