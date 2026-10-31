-- Eventos de venda recebidos por webhook da Kiwify.
-- Uma linha por (pedido, tipo de evento): reenvios e replays não duplicam.
create table if not exists public.kiwify_events (
  id bigint generated always as identity primary key,
  order_id text not null,
  event_type text not null,
  order_status text,
  product_id text,
  product_name text,
  customer_email text,
  customer_name text,
  charge_amount_cents integer,
  payment_method text,
  approved_date text, -- formato da Kiwify, sem fuso: 'AAAA-MM-DD HH:MM'
  payload jsonb not null,
  received_at timestamptz not null default now(),
  constraint kiwify_events_order_event_key unique (order_id, event_type)
);

create index if not exists kiwify_events_received_at_idx
  on public.kiwify_events (received_at desc);

-- Só o servidor (service role) lê e escreve. Sem políticas = nenhum acesso pelo navegador.
alter table public.kiwify_events enable row level security;
