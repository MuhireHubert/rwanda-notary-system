# Rwanda e-Notary Prototype

A frontend-only demonstration of a proposed **Notary Verification & Supervision Platform for MINIJUST**.

## What is included

- MINIJUST national command centre
- Simulated notary registry
- Simulated document registry
- Unique notary/document references
- Real QR-code generation for demo documents
- Public document verification screen
- Performance and compliance alerts
- Automated-report concept
- Responsive UI

## Important

This is a **prototype only**. It uses fictional records and does not connect to MINIJUST, Irembo, RDB, Rwanda identity systems, payment systems, or real notarial databases.

## Run locally

Requirements: Node.js 20+

```bash
npm install
npm run dev
```

Then open the local Vite address shown in the terminal.

## Suggested next development phase

1. Move mock records to PostgreSQL.
2. Add Node/Express API.
3. Add role-based authentication: MINIJUST, notary, applicant, public verifier.
4. Create a proper notary authorization registry.
5. Add immutable audit logs.
6. Add secure document storage.
7. Integrate approved digital-signature infrastructure.
8. Add real QR verification endpoint.
9. Add report generation/export.
10. Design government integration APIs only after requirements and authorization are confirmed.
