# TradeFlow Dashboard

A modern full-stack import operations and inventory management platform built for cross-border commerce between Germany and Bangladesh.

TradeFlow helps manage:

- Product catalog
- Purchases and procurement
- Shipment lifecycle
- Multi-location inventory
- FIFO inventory accounting
- Sales and profit tracking
- Operational expenses
- Business analytics and reporting

Built with Next.js, Supabase, TypeScript, Tailwind, and shadcn/ui.





## Features

### Authentication & Roles
- Supabase Authentication
- Role-based access control
- Admin and Partner permissions
- Protected routes and server actions

### Product Management
- Product catalog management
- Product editing
- Pricing in EUR and BDT
- Exchange rate conversion

### Inventory Management
- Multi-location inventory:
  - Germany
  - In Transit
  - Bangladesh
- Inventory adjustments with audit trail
- Inventory movement tracking

### Shipment Management
- Draft shipment workflow
- Shipment send/receive lifecycle
- Shipment item management
- Shipping and customs cost tracking

### FIFO Accounting
- FIFO batch tracking
- Landed cost calculation
- Shipment profitability
- Sale profit tracking

### Sales System
- Transaction-safe sale recording
- Customer-linked sales
- FIFO consumption allocation
- Sale void/reversal flow
- Payment status tracking

### Customer & Delivery Operations
- Customers module
- Delivery tracking from sales
- Delivery cost accounting
- Customer analytics and repeat-buyer insights

### Expenses & Accounting
- Expense tracking
- Shipment-linked expenses
- Net profit calculations
- Audit logging

### Reports & Analytics
- Revenue and profit dashboard
- Shipment profitability reports
- Product profitability reports
- KPI cards and charts

### UX & UI
- Fully responsive design
- Dark/light mode
- Searchable/sortable tables
- CSV exports
- Loading/error states
- Accessible UI


## Tech Stack

### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Table
- Recharts
- React Hook Form
- Zod

### Backend
- Supabase
- PostgreSQL
- Supabase RPC functions
- Row Level Security (RLS)

### Architecture
- Server Components
- Server Actions
- Transaction-safe SQL RPC
- FIFO inventory accounting
- Audit logging system


## System Architecture

TradeFlow uses a hybrid architecture:

- Next.js App Router for frontend and server rendering
- Supabase PostgreSQL for persistence
- Supabase Auth for authentication
- SQL RPC functions for transaction-critical operations

Critical operations are executed atomically inside PostgreSQL functions:

- record_sale_with_fifo
- void_sale_with_reversal

This guarantees inventory consistency and FIFO correctness.

## FIFO Inventory Accounting

TradeFlow uses FIFO (First In, First Out) inventory accounting.

When shipments are received:

1. Inventory batches are created
2. Each batch stores:
   - remaining quantity
   - landed cost
   - shipment linkage

When a sale occurs:

1. The oldest available inventory batch is consumed first
2. sale_batch_consumptions records:
   - consumed quantity
   - landed cost
   - revenue
   - gross profit

This enables:
- Accurate profit reporting
- Shipment profitability
- Product profitability
- Historical inventory traceability


## Future Improvements

- PDF invoices
- Email notifications
- Supplier management
- Advanced analytics filters
- PWA support
- Multi-currency accounting
- Barcode scanning



## About This Project

This project was designed and developed as a real-world business operations platform focused on inventory, logistics, and profitability management for cross-border commerce.

The system emphasizes:
- transactional safety
- inventory correctness
- auditability
- responsive UX
- scalable architecture