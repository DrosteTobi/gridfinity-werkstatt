create table if not exists orders (
  id text primary key,
  created_at timestamptz not null default now(),
  locale text not null default 'de',
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_notes text,
  drawer_width integer not null,
  drawer_depth integer not null,
  drawer_layers integer not null default 1,
  items_json jsonb not null,
  total_cents integer not null,
  currency text not null default 'EUR',
  status text not null default 'new'
);

create index if not exists orders_created_at_idx on orders (created_at desc);
