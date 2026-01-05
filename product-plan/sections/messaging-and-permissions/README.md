# Messaging & Permissions

## Overview

Professional parent-to-parent communication platform combining threaded messaging with formal permission request workflows. Parents can send messages, create permission requests for decisions requiring approval, and track the status of all communications in a unified interface.

## User Flows

- Send and receive messages in chat-style conversations with threading
- Mark messages as read/unread to track communication status
- Create permission requests for medical decisions, travel plans, schedule changes, or extracurricular activities
- Submit permission request → Awaiting response → Approve/Deny with status tracking
- Filter between messages and permission requests in combined view
- View conversation history and permission request outcomes

## Design Decisions

- Combined view with filters to toggle between all communications, messages only, or permissions only
- Chat-style message bubbles for messaging interface
- Split view layout showing conversation list with detail panel
- Unread message indicators in conversation list
- Permission requests display with distinct visual styling/badges
- Action buttons (Approve/Deny) for pending permission requests
- Status indicators showing Pending/Approved/Denied states for all permission requests
- Conversation previews in list view showing latest message snippet

## Data Used

**Entities:** Parent, Message, PermissionRequest, Conversation

**From global model:** Parent, Message, PermissionRequest

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `MessagingAndPermissions` — Combined messaging and permission request workspace

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewConversation` | Called when user wants to view a conversation's details |
| `onSendMessage` | Called when user wants to send a new message in a conversation |
| `onMarkAsRead` | Called when user wants to mark a conversation as read |
| `onMarkAsUnread` | Called when user wants to mark a conversation as unread |
| `onCreateMessage` | Called when user wants to create a new message conversation |
| `onCreatePermissionRequest` | Called when user wants to create a new permission request |
| `onApprovePermission` | Called when user approves a permission request |
| `onDenyPermission` | Called when user denies a permission request |
