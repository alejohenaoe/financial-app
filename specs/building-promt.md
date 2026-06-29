# Personal Finance Tracker - Initial Project Specification

## Objective

Build a **Progressive Web App (PWA)** for personal finance management.

The application is for **one single user** (me). It is **not** intended to be a commercial product or support multiple users.

The main goal is to make recording financial movements extremely fast (less than 5 seconds).

The application should feel like a native iPhone app when installed as a PWA.

---

# Tech Stack

Use the following technologies:

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* React Router
* Supabase
* PostgreSQL
* Lucide Icons
* Recharts

Do not introduce additional libraries unless they clearly simplify the project.

Avoid overengineering.

---

# General Principles

* Keep the codebase simple.
* Prefer readability over cleverness.
* Build only what is required.
* Keep components small and reusable.
* Avoid unnecessary abstractions.
* No premature optimization.
* No enterprise patterns.

This is a personal application.

---

# Core Business Logic

The application stores **financial movements**.

There is only one entity:

**Transaction**

A transaction can be:

* Income
* Expense

The current balance is **never stored**.

Always calculate:

Balance = Total Income − Total Expenses

---

# Database

Use a single table:

## transactions

Fields:

* id
* user_id
* type (income | expense)
* amount
* category (only for expenses)
* description (optional)
* transaction_date
* created_at
* updated_at

Enable Row Level Security.

Each user can only access their own transactions.

---

# Categories

Categories are fixed.

Initial categories:

* Food
* Groceries
* Transportation
* Health
* Entertainment
* Shopping
* Home
* Work
* Other

Do not create a categories table.

---

# Features

## Dashboard

Display:

* Current Balance
* Total Income
* Total Expenses
* Last 5 transactions

---

## Register Transaction

The registration form is the most important part of the application.

Fields:

* Amount
* Type (Expense / Income)
* Category (only if Expense)
* Description (optional)
* Date

After saving:

* Update balance immediately.
* Update recent transactions.
* Clear the form.
* Focus the Amount field again.

Do not navigate away after saving.

---

## History

Display all transactions.

Requirements:

* Infinite scroll
* Load 10 records at a time
* Search by description
* Filter by type
* Filter by date

Allow:

* Edit
* Delete

---

## Analytics

Display:

* Expenses grouped by category
* Bar chart
* Percentage by category

Allow filtering by:

* Current Month
* Previous Month
* Current Year
* Custom Range

---

# UI Principles

Design for mobile first.

Primary target:

iPhone.

The interface should be:

* Minimal
* Clean
* Fast
* Spacious
* Easy to understand

Avoid dashboard-style interfaces.

Prioritize speed of use.

---

# Project Structure

Keep the structure simple.

Example:

```text
src/
    components/
    pages/
    hooks/
    services/
    utils/
    types/
    lib/
```

Do not create unnecessary folders.

---

# Forms

Use:

* React Hook Form
* Zod

Validation:

Income:

* amount required
* category must be empty

Expense:

* amount required
* category required

---

# Services

Create a single transaction service responsible for all CRUD operations.

Do not spread Supabase calls across the application.

---

# Performance

* Lazy load pages when appropriate.
* Use pagination.
* Avoid unnecessary re-renders.
* Keep the application lightweight.

---

# PWA

Configure the application as an installable Progressive Web App.

Requirements:

* Installable on iPhone.
* Proper icons.
* Manifest.
* Theme color.

Offline support is not required.

---

# Code Quality

* TypeScript strict mode.
* No use of any.
* Prefer composition over duplication.
* Small components.
* Small functions.
* Clear naming.
* Self-explanatory code.

---

# What NOT to Build

Do not implement:

* Budgets
* Savings goals
* Multiple accounts
* Recurring transactions
* Notifications
* Bank synchronization
* AI features
* OCR
* CSV import/export
* Multi-currency
* Admin panels

Only build what is described above.

---

# Before Writing Code

Before implementing anything:

1. Analyze these requirements.
2. Propose the project structure.
3. Explain any improvements you recommend.
4. Ask for approval if you believe an architectural decision should change.
5. Once approved, begin implementing the application incrementally, keeping commits/features small and easy to review.

# Do not try to generate the entire application in one step.

Build it incrementally.
First, scaffold the project and configure the stack.
Then implement the database.
Then authentication.
Then transactions.
Then the dashboard.
Then history.
Then analytics.
After each phase, briefly explain what was implemented and wait for the next instruction if clarification is needed.
If you have to choose between a simpler solution and a more sophisticated one, choose the simpler solution unless there is a strong technical reason not to.