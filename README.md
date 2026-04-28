# TradeFlow Dashboard

TradeFlow Dashboard is an internal business operations web app for a small Germany-to-Bangladesh import and resale workflow.

It helps track products, purchases, shipments, inventory movement, Bangladesh-side sales, expenses, and profitability.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- React Server Actions
- Recharts
- Jest
- React Testing Library

## Core Features

### Authentication and Roles

- Supabase email/password authentication
- Admin and partner roles
- Protected routes
- Role-aware navigation
- Server-side authorization checks

### Products

- Add products
- Store SKU, brand, category, EUR purchase price, exchange rate, and BDT selling price
- Product listing with empty and error states

### Purchases

- Record Germany-side purchases
- Automatically increase Germany inventory
- Log inventory movements
- Create audit logs

### Shipments

- Create multi-item shipments
- Track shipment status
- Move inventory from Germany to In Transit
- Move inventory from In Transit to Bangladesh
- Prevent shipment when Germany stock is insufficient
- Audit shipment status changes

### Inventory

- View stock by location:
  - Germany
  - In Transit
  - Bangladesh
- Total stock calculation
- Low-stock and out-of-stock status badges

### Sales

- Record Bangladesh-side sales
- Automatically decrease Bangladesh inventory
- Prevent sales when Bangladesh stock is insufficient
- Track payment status
- Log inventory movement and audit events

### Expenses

- Track shipping, customs, packaging, marketing, delivery, and other costs
- Optional shipment linking
- Separate BDT and EUR expense handling

### Dashboard

- Total revenue
- Total expenses
- Estimated profit
- Profit margin
- Inventory by location
- Monthly revenue, expense, and profit chart

### Reports

- Product-level profitability
- Monthly revenue vs expenses
- Gross profit estimate
- Clear MVP note for landed-cost improvement

## Business Rules

- Purchases increase Germany inventory.
- Sent shipments move stock from Germany to In Transit.
- Received shipments move stock from In Transit to Bangladesh.
- Sales decrease Bangladesh inventory.
- Partners cannot delete historical records.
- Important actions are logged in `audit_logs`.

## Database Tables

- `profiles`
- `products`
- `inventory`
- `inventory_movements`
- `purchases`
- `shipments`
- `shipment_items`
- `sales`
- `expenses`
- `audit_logs`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rizwann/tradeflow-dashboard.git
cd tradeflow-dashboard
