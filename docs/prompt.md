

<role>
You are a Principal Full-Stack Engineer and Lead UI/UX Architect specializing in AI-Native Web Applications, React, TypeScript, and Tailwind CSS. You follow Spec-Driven Development (SDD) principles, writing clean, type-safe, modular, and maintainable code.
</role>

<task>
Implement the production-ready MVP for "SpineSync" — a mobile-first AI-native web application for 30-day cervical disc recovery and ergonomic health management.
</task>

<context>
SpineSync translates a structured 30-day clinical recovery playbook into an interactive, highly responsive web application designed primarily for mobile viewport screens (iOS/Android browsers). 

Tech Stack Requirements:
- Core: React 18+ with TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS (with a modern, calm healthcare design system — e.g., slate, teal, and emerald accents)
- Icons: Lucide React
- State Management: React Context API or Zustand with LocalStorage persistence
- Visuals/Charts: Recharts or Lightweight Canvas/SVG
</context>

<specifications_and_rules>
1. Adaptive Exercise Logic (Decision Tree):
   - Every day begins with a Pain Check-in (VAS Score 0–10).
   - IF VAS >= 7 OR radiating arm pain is flagged:
     -> Activate "Flare-Up Emergency Mode": Suppress isometric exercises, show cold/hot therapy, restrict to rest protocols, and display a medical warning banner.
   - IF VAS < 7 AND pain increased vs. yesterday:
     -> Automatically dial back exercise difficulty by 1 level.
   - IF VAS < 7 AND pain decreased/stable:
     -> Proceed with standard phase-based daily protocol.

2. Comprehensive Lifestyle & Ergonomics Module:
   - Provide interactive checklists and actionable guidance for daily activities:
     - Desk/Workstation (Monitor height, 20-20-20 breaks)
     - Sleeping & Pillows (Positioning, Memory Foam alignment)
     - Driving, Cooking, Bathing, Travel, Childcare, Household Chores, and Sexual Health.

3. Progress Metrics & Formulas:
   - Neck Disability Index (NDI %): Calculated on Days 1, 15, and 30.
     Formula: (Sum of answered scores / (Number of answered questions * 5)) * 100
   - Daily Adherence Rate (%): 
     Formula: ((Completed Exercises + Checked Ergonomic Tasks) / Total Scheduled Tasks) * 100
   - Pain Delta: 3-day baseline average minus 3-day recent average.

4. Data Architecture (JSON Schema Example):
   Ensure local state and data persistence follow this exact schema structure:
   ```json
   {
     "user_id": "usr_local",
     "current_day": 1,
     "phase": 1,
     "daily_log": {
       "date": "2026-09-25",
       "pain_checkin": {
         "vas_score": 3,
         "radiating_pain": false,
         "numbness_present": false
       },
       "adapted_plan_level": "standard",
       "exercises_completed": [
         { "exercise_id": "chin_tuck", "sets_done": 2, "reps_done": 10, "status": "completed" }
       ],
       "ergonomics_checklist": {
         "monitor_height_checked": true,
         "hourly_breaks_count": 4,
         "sleeping_position_adhered": true
       },
       "daily_compliance_percentage": 100.0
     }
   }

```

</specifications_and_rules>

<instructions_and_workflow>
Please think through the application architecture step-by-step before outputting code:

Step 1: Application Architecture & State Management

* Define TypeScript types (`types/recovery.ts`) matching the JSON schema, daily logs, exercises, and NDI metrics.
* Set up state persistence using LocalStorage to maintain user progress across browser reloads.

Step 2: Core Components & Layout

* Create a mobile-first container with a responsive bottom navigation bar (Home/Today, Exercises, Ergonomics, Analytics/Progress).
* Build the `DailyPainCheckin` component featuring the adaptive logic tree (handling flare-ups vs. standard plan).

Step 3: Interactive Modules

* Build `ExerciseTracker`: Timer for holds (5-10 second holds with visual ring/counter), step-by-step instructions, and completion toggles.
* Build `ErgoGuide`: Categorized list of daily activities (Work, Driving, Sleeping, Bathing, Chores) with quick toggleable checklists.
* Build `ProgressDashboard`: Recharts/SVG graphs for Pain Trend (VAS over 30 days) and Adherence Rate.

Step 4: Refinement & UI Polish

* Add subtle UI micro-interactions (e.g., smooth transitions, clear status badges for Flare-Up mode).
* Ensure 100% responsiveness on mobile screen viewports (375px–430px widths).
</instructions_and_workflow>

<output_format>
Start by explaining your technical strategy in 3 concise bullet points. Then, deliver the modular directory structure and production-ready TypeScript/React code files sequentially.
</output_format>

the result should be 100% free for both development and deployment, especially for an MVP/Personal project.