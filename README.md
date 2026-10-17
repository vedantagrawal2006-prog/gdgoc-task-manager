# GDGoC Task Manager

A simple task management web app for planning GDGoC IET DAVV activities like workshops, hackathons and sessions.

Made by Vedant Agrawal for the GDGoC IET DAVV Web Development Lead assessment.

## Problem

When a club like GDGoC plans an event, the work gets split between many people: posters, registrations, hall booking, slides, website updates. Most of this is tracked in WhatsApp groups. Messages get buried, nobody is sure who is doing what, and deadlines get missed without anyone noticing until the last day.

## Solution

One place where the lead can create tasks, assign them to members and set deadlines, and every member can see and update the status of their own work. The board shows at a glance what is pending, what is in progress and what is overdue.

## Features

1. **Task assignment**: a Lead can create a task with a title, description, deadline and priority, and assign it to a team member.
2. **Status tracking**: tasks move across three columns: To Do, In Progress and Done.
3. **Deadlines**: every task shows how many days are left. Tasks due soon are marked yellow and overdue tasks are marked red. Tasks are sorted by the closest deadline.
4. **User roles**:
   - **Lead**: can add tasks, add members, delete tasks and change the status of any task.
   - **Member**: can only change the status of tasks assigned to them. Other tasks are view-only.
5. **Filters**: view all tasks, only my tasks, or tasks of a specific member.
6. **Dashboard numbers**: total, to do, in progress, done and overdue counts.
7. **Saved data**: everything is saved in the browser (localStorage), so it stays after a page refresh.
8. **Responsive**: works on mobile and desktop.

## Tech used

- HTML
- CSS (Flexbox and Grid, media queries for mobile)
- JavaScript (DOM manipulation, event handling, localStorage)

No frameworks or libraries are used.

## How to run

1. Download or clone this repository.
2. Open `index.html` in any browser.

## How to use

1. Use the **Logged in as** dropdown at the top to switch between users. Vedant is a Lead; Aman, Riya and Kunal are Members.
2. As a Lead, add a task from the "Add a new task" form and assign it to someone.
3. Switch to that member and change the task status from the dropdown on the task card.
4. Use **Reset demo data** to go back to the sample tasks.

Note: switching users from a dropdown is only for this prototype, to show how roles work. A real version would need proper login.

## Project structure

```
index.html   - page layout
style.css    - styling and responsive design
script.js    - data, roles, rendering and events
hackathon-plan.md - management task: plan for a 4 hour web dev hackathon
```

## What I would add next

- Login with Google (Firebase Authentication) instead of the user dropdown
- Store data in Firebase Firestore so the whole team shares the same board
- Comments on tasks
- Email or notification reminders before deadlines
- Drag and drop between columns
