# Requirements: SmartBuddy AI

## Overview
SmartBuddy AI is a micro-learning app that generates bite-sized lessons on various topics scaled to the user's available time (5, 10, or 15 minutes). It helps busy people learn something new in short bursts while waiting, with built-in quiz questions and an ask-a-question feature for deeper understanding.

## Functional Requirements

### Topic & Duration Selection

| ID | Requirement |
|----|-------------|
| REQ-001 | WHEN the user first opens the app THE SYSTEM SHALL display a grid of at least 5 predefined topic options (Python, Web Development, Artificial Intelligence, Science, General Knowledge) |
| REQ-002 | WHEN the user selects a topic THE SYSTEM SHALL transition to a duration selection screen |
| REQ-003 | WHEN the user has selected a topic THE SYSTEM SHALL display three duration options (5, 10, 15 minutes) as clearly labeled buttons |
| REQ-004 | WHEN the user selects a duration THE SYSTEM SHALL begin generating a lesson and show a loading state |

### Lesson Generation

| ID | Requirement |
|----|-------------|
| REQ-005 | WHEN lesson generation begins THE SYSTEM SHALL display a loading indicator with explanatory text and a cancel button |
| REQ-006 | WHEN lesson generation takes longer than 7 seconds THE SYSTEM SHALL display an additional reassurance message |
| REQ-007 | WHEN the user clicks cancel during generation THE SYSTEM SHALL stop showing the loading state and prevent late results from being displayed |
| REQ-008 | WHEN lesson generation completes successfully THE SYSTEM SHALL display the lesson content organized with an Explanation section, an Example section, and a Quiz section |
| REQ-009 | WHEN lesson generation fails THE SYSTEM SHALL display an error message with a retry button |

### Lesson Content & Views

| ID | Requirement |
|----|-------------|
| REQ-010 | WHEN a lesson is displayed THE SYSTEM SHALL show the full lesson text in a readable format with consistent spacing |
| REQ-011 | WHEN a full lesson is displayed THE SYSTEM SHALL include a "Make it shorter" button |
| REQ-012 | WHEN the user clicks "Make it shorter" THE SYSTEM SHALL generate a condensed version with only key takeaway, essential explanation, and brief example |
| REQ-013 | WHEN a shortened version exists THE SYSTEM SHALL allow the user to toggle between full and shortened views using labeled buttons |
| REQ-014 | WHEN the user switches duration while a lesson exists THE SYSTEM SHALL generate a new lesson for the selected duration |

### Quiz Feature

| ID | Requirement |
|----|-------------|
| REQ-015 | WHEN a lesson is displayed THE SYSTEM SHALL show 2-3 quiz questions below the lesson content |
| REQ-016 | WHEN a quiz question is shown THE SYSTEM SHALL display the question text and a "Reveal answer" button |
| REQ-017 | WHEN the user clicks "Reveal answer" THE SYSTEM SHALL display the correct answer and explanation |
| REQ-018 | WHEN an answer is revealed THE SYSTEM SHALL allow the user to click "Hide answer" to collapse it again |

### Ask a Question Feature

| ID | Requirement |
|----|-------------|
| REQ-019 | WHEN a lesson is displayed THE SYSTEM SHALL show a text input field labeled "Ask a question about [topic]" with an "Ask" button |
| REQ-020 | WHEN the user enters text and presses Enter or clicks the "Ask" button THE SYSTEM SHALL submit the question if the input is not empty |
| REQ-021 | WHEN a question is submitted THE SYSTEM SHALL display a loading indicator with the text "Finding your answer..." |
| REQ-022 | WHEN an answer is received THE SYSTEM SHALL display the question and answer in a conversational card format |
| REQ-023 | WHEN the user asks multiple questions THE SYSTEM SHALL display all questions and answers in chronological order |
| REQ-024 | WHEN a new answer arrives THE SYSTEM SHALL scroll smoothly to show the most recent answer |
| REQ-025 | WHEN question submission fails THE SYSTEM SHALL display an error message with the question text and a retry button |

### Navigation & Reset

| ID | Requirement |
|----|-------------|
| REQ-026 | WHEN the user is on the duration selection screen THE SYSTEM SHALL display a "← Back" button that returns to topic selection |
| REQ-027 | WHEN the user is viewing a lesson THE SYSTEM SHALL display a "← Start over" button that resets the app to topic selection |
| REQ-028 | WHEN the user clicks reset THE SYSTEM SHALL clear all lesson data, quiz state, Q&A history, and return to the initial topic selection screen |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | THE SYSTEM SHALL be fully responsive on mobile (< 640px), tablet (640px–1024px), and desktop (> 1024px) viewports |
| NFR-002 | THE SYSTEM SHALL use a blue and white color scheme with secondary accent colors (amber for shortened content, red for errors) |
| NFR-003 | THE SYSTEM SHALL display at least 48px minimum touch targets for all interactive buttons |
| NFR-004 | THE SYSTEM SHALL provide focus indicators (ring outlines) on all keyboard-interactive elements for accessibility |
| NFR-005 | THE SYSTEM SHALL use aria-labels and aria-expanded attributes to support screen reader users |
| NFR-006 | THE SYSTEM SHALL display loading spinners and appropriate empty/error/loading states for all async operations |
| NFR-007 | THE SYSTEM SHALL present text in a readable format with appropriate line-height and font sizing (base 16px, scaling to 20px on larger screens) |

## Design Notes

- **Layout**: Single-column card-based layout centered with max-width constraint; responsive grid (1 column mobile, 2 columns tablet+) for topic selection
- **Colors**: Primary blue (#0369a1 and shades), white backgrounds, amber (#b45309) for shortened content, red (#dc2626) for errors
- **Responsive Behavior**: Button text and sizing adjust for mobile; flex layout switches from column to row on larger screens; padding increases from 20px (mobile) to 32px (desktop)
- **Loading State**: Animated spinner with explanation text; longer operations trigger reassurance message after 7 seconds; cancel button provided
- **Error State**: Red-bordered container with error message and retry button; contextual error for quiz shortening preserves original lesson
- **Empty State**: Initial screen shows topic grid; once topic selected, prompts for duration
- **Shortened Lesson**: Labeled "Shortened version" with amber styling to distinguish from full lesson; toggle button to return to full view
- **Quiz**: Each question is collapsible; answer revealed on demand with explanation included
- **Q&A History**: Conversational cards in blue with question and answer; auto-scrolls to newest answer
- **Button States**: Active duration button highlighted in blue; disabled buttons reduce opacity during loading; hover states provide visual feedback