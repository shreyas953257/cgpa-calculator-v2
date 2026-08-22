# Design Directions

## 1. Academic Ledger

**Very Brief Intro:** A warm editorial take on academic organization, inspired by tidy study planners and printed grade sheets. It uses clear hierarchy, generous breathing room, and quiet confidence rather than dashboard clutter.

**Probability:** 0.07

## 2. Campus Bulletin

**Very Brief Intro:** A friendly utility interface that feels like a modern university noticeboard. Informational color bands and compact cards support quick, low-stress calculations between classes.

**Probability:** 0.04

## 3. Precision Studio

**Very Brief Intro:** A restrained, contemporary productivity tool built around numerical clarity and softly tactile controls. A strong calculation rail makes the most important result immediately visible.

**Probability:** 0.09

# Chosen Direction: Academic Ledger

## Design Movement

**Academic Ledger** draws from contemporary editorial design and well-crafted paper study planners. It gives the calculator the reassuring clarity of a personal academic record while remaining fast and effortless to use on a phone.

## Core Principles

1. **Calculation before decoration:** Numerical results, subject entries, and validation cues always take visual priority.
2. **Guided hierarchy:** Each semester forms a self-contained chapter, with its local SGPA anchored near the data that creates it.
3. **Tactile restraint:** Soft paper-toned surfaces, thin rules, and modest shadows make controls approachable without visual noise.
4. **Progressive disclosure:** Supporting grade details remain available but secondary to immediate entry and calculation.

## Color Philosophy

The interface uses a **warm parchment** foundation to avoid sterile dashboard white, deep ink for dependable readability, and one signature **scholarly teal** for actions and valid progress. A muted sienna accent distinguishes removal and error states without making the page feel alarming. Color communicates state and hierarchy rather than serving as decoration.

## Layout Paradigm

The page is structured as an **editorial ledger** rather than a centered dashboard: a slim header leads to an asymmetric content field where a persistent calculation rail sits beside stacked semester chapters on desktop. On mobile, the calculation rail becomes the opening summary, followed by scrollable semesters. Every chapter includes a visible summary line and action row.

## Signature Elements

1. **Ledger rules:** Fine horizontal separators and small section labels echo a carefully organized academic record.
2. **Result stamp:** SGPA and CGPA appear in high-contrast rounded-square stamps with a subtle inset border.
3. **Calculation rail:** A sticky desktop summary panel continuously shows overall credits and CGPA.

## Interaction Philosophy

Interactions should feel like editing a real study planner: direct, forgiving, and immediately legible. Adding a subject creates a new row with focus-ready fields; errors appear next to the input that needs attention, and button states provide compact feedback rather than interrupting the user.

## Animation

Use short, intentional transitions only. Newly added rows enter with a 180ms opacity-and-upward transform; calculator values ease between states over 180ms without exaggerated motion. Buttons compress to 0.97 on press. All non-essential animation is disabled for reduced-motion preferences.

## Typography System

**Fraunces** is reserved for the large CGPA value and high-level display moments, giving results a considered academic character. **DM Sans** handles labels, inputs, body copy, and buttons for dense clarity. Labels use compact uppercase tracking; numeric values use tabular figures and a strong weight.

## Brand Essence

**Gradebook is the clear, personal academic calculator for students who want their progress visible without the spreadsheet stress.**

Personality: **grounded, attentive, encouraging.**

## Brand Voice

Headlines are direct and purposeful; CTAs use plain academic language; microcopy anticipates uncertainty without sounding technical.

Example lines:

> Keep each semester in view.

> Add the grades you have. Your standing updates as you go.

## Wordmark & Logo

The mark is a simple **stacked ledger corner**: three offset teal rule marks that form an abstract “G” at a glance, suggesting pages, subjects, and cumulative progress. The wordmark uses a compact DM Sans semibold treatment with a small Fraunces accent only where it adds character.

## Signature Brand Color

**Ledger Teal — #0E766E**

## Style Decisions

- Imagery uses tactile academic materials—ruled paper, planners, pencils, grade sheets, and ledger pages—with teal accents and warm natural light.
- The calculation rail reads as an official academic standing card through flat scholarly teal, inset rules, and high-contrast tabular numerals rather than glass-like effects.
- Supporting copy stays direct, encouraging, and specific to semesters, grades, credits, and academic standing.
- Course-entry controls use ruled-row rhythm, compact uppercase labels, and bottom-rule inputs so the active worksheet reads as an editable academic ledger rather than a generic form.
- Local SGPA and final CGPA values share a double-rule, official-record stamp treatment; teal is reserved for standing, correct data, actions, and ledger marks.
- The first viewport prioritizes the active semester ledger and cumulative standing; the editorial hero is compact context rather than a dominant banner.
- Academic imagery acts as restrained paper evidence at the margin, while result stamps use high-contrast tabular numerals and double-rule framing.
