# SAS Digital Toolkit — Leadership Brief

## Executive Summary

The SAS Digital Toolkit is an internal platform that gives Singapore American School a unified, real-time view of every educational technology application in use across the school. It replaces fragmented spreadsheets and informal processes with a structured system for discovering, managing, evaluating, and renewing software — with clear ownership, role-based access, and data-driven decision making.

---

## The Problem

Schools invest significantly in educational technology. At SAS, the portfolio spans 180+ applications across three divisions, dozens of departments, and a range of license types — from enterprise-wide platforms to individual teacher tools.

Managing this portfolio has historically meant:

- **No single inventory**: App data lived in Google Sheets, email threads, and personal knowledge. Different divisions maintained different lists.
- **Unclear ownership**: When something went wrong with a tool, it was often unclear who was responsible — the person who requested it, the person who approved it, or the person who managed the vendor relationship.
- **Renewal decisions without evidence**: Apps were renewed (or not) based on incomplete information. Teacher feedback was collected informally, if at all. Budget conversations lacked usage data.
- **Compliance blind spots**: Privacy policies, terms of service, and risk assessments were not systematically tracked. Answering compliance questions required manual research.

---

## What the Digital Toolkit Delivers

### 1. Visibility

Every application in the SAS ecosystem is cataloged with its category, division, department, audience, cost, license type, vendor, contract dates, compliance documents, and more. Staff can search and filter the full catalog. Leaders see portfolio-level data at a glance.

### 2. Accountability

Each app is assigned an **Owner**, one or more **Champions**, and a **TIC Manager**. These roles are visible to everyone. When a teacher has a question, when a contract needs attention, or when a renewal is due — there is always a named person responsible.

### 3. Structured Renewal Process

The toolkit introduces a four-stage renewal workflow:

| Stage | Who | What Happens |
|-------|-----|--------------|
| **Assessment** | Teachers | Submit structured feedback on how they use the tool, its impact, and whether it should continue |
| **Aggregation** | AI | Summarizes patterns across all teacher submissions for a given app |
| **TIC Review** | TIC | Reviews feedback, adds technical and strategic context, makes a recommendation |
| **Decision** | Approver | Makes the final call with full context: teacher sentiment, TIC recommendation, cost, and alternatives |

Every stage is tracked. Every decision is documented. The result is an auditable, evidence-based renewal process.

### 4. Compliance and Risk Management

For every application, the system tracks:

- Privacy policy URL
- Terms of service URL
- GDPR compliance documentation
- Risk rating (Low / Medium / High)
- Assessment status
- SSO and authentication configuration

This means compliance questions can be answered immediately, not after days of research.

### 5. Operational Efficiency

The admin interface supports Notion-style inline editing — authorized users click a cell and edit it directly. No separate forms, no context switching. Contract dates, costs, vendor contacts, and compliance data are all editable in place.

Data syncs bidirectionally between the web application (Supabase) and the existing Google Sheets — no need to abandon current workflows while the transition happens.

---

## Who Uses It

| Role | What They Do |
|------|-------------|
| **Teachers & Staff** | Discover tools, find tutorials, submit renewal feedback, request new apps |
| **TICs** | Manage division portfolios, review feedback, generate AI summaries, recommend actions |
| **Directors / Approvers** | Make renewal and budget decisions with full evidence |
| **EdTech Administrators** | Manage the catalog, users, roles, compliance data, and system integrations |

Access is controlled by role. Staff see what they need. Admins see everything. No one sees more than their role requires.

---

## Strategic Value

### For Budget Conversations
Every app has its annual cost, license count, license type, and budget owner documented. Renewal decisions include teacher feedback and TIC recommendations. Leadership can see total spend, filter by division or department, and identify underutilized tools.

### For Accreditation and Audits
A complete, searchable record of every tool in use — with ownership, compliance documentation, and renewal history — supports accreditation reporting and audit readiness.

### For Teacher Experience
Instead of asking "does the school have a tool for X?", teachers search the catalog. Instead of emailing IT, they see who owns the tool and how to get help. Instead of hoping their feedback is heard, they submit structured assessments that flow directly into the decision process.

### For Risk Reduction
Centralized compliance tracking means the school can identify tools without privacy policies, flag high-risk applications, and ensure every renewal decision considers data safety — not just cost and convenience.

---

## Current State

- **183 applications** cataloged with full metadata
- **50+ fields** per application (product details, contracts, compliance, contacts, assessments)
- **Four user roles** with graduated permissions
- **Bidirectional sync** with existing Google Sheets workflows
- **EdTech Impact integration** for external assessment data and ratings
- **AI-powered summaries** for teacher feedback during renewal cycles

---

## What We Are Asking For

The Digital Toolkit is built and operational. We are seeking leadership support for:

1. **Adoption**: Encourage division leaders and TICs to use the toolkit as the primary reference for technology decisions
2. **Process alignment**: Formalize the renewal workflow so teacher feedback flows through the toolkit, not around it
3. **Data completeness**: Support efforts to fill in ownership, compliance, and contract data for all 183 applications
4. **Visibility**: Share the toolkit with parents and community members as evidence of thoughtful technology stewardship

---

*Developed by the Singapore American School Technology & Innovation Team*
