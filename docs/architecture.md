# Architecture Diagram

This document outlines the architecture of the Decision Lag application.

```
         ┌────────────────────────┐
         │ External Web App        │  (Next.js / Node)
         │ "Decision Debt Studio"  │
         └───────────┬────────────┘
                     │ REST API calls
                     ▼
     ┌───────────────────────────────────┐
     │ Salesforce Org (System of Action) │
     │  - Decision_Insight__c            │
     │  - Decision_View_Event__c         │
     │  - Task                           │
     │  - Users / Teams                  │
     └───────────┬───────────────────────┘
                 │ Ingest / Sync
                 ▼
       ┌────────────────────────────┐
       │ Salesforce Data Cloud       │
       │  - Data Streams             │
       │  - DMOs (modeled objects)   │
       │  - Calculated insights      │
       └───────────┬────────────────┘
                   │ Governed analytics source
                   ▼
        ┌───────────────────────────┐
        │ Tableau Next              │
        │  - Semantic Model (SDM)   │
        │  - Dashboards / Metrics   │
        │  - Concierge (NLQ)        │
        └───────────┬──────────────┘
                    │ Trigger actions
                    ▼
     ┌────────────────────────────────────┐
     │ Automation Layer                    │
     │  - Flow / Apex                      │
     │  - Slack notification (optional)    │
     │  - Auto-Task creation               │
     └────────────────────────────────────┘
```
