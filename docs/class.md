# Class Feature 

## Section Requirement

### Overview
This document outlines the detailed specifications for the class management system in WhyGym.

### Core Features

### 1. Class Payment System
- Members can purchase class slots through the app
- Payment methods use existing
- Payment flow:
  - Select class
  - Choose payment method
  - Confirm booking
  - Receive confirmation email/notification
- no refund policy

### 2. Class Categories
- Minimum of 2 categories required:
  - Primary categories (e.g., Yoga, HIIT, Strength Training)
  - Secondary categories (e.g., Beginner, Intermediate, Advanced)
- Category attributes:
  - Name
  - Description
  - Difficulty level
  - Required equipment
  - Duration
  - Target audience
  - Prerequisites (if any)

### 3. Class Capacity Management
- Maximum threshold (capacity) per class:
  - change to lower number by class admin, cannot increase the capacity
  - Default maximum: 500 participants
  - Minimum participants: 1
- Real-time capacity tracking

### 4. Class Cancellation System
- Class admin capabilities:
  - Cancel class with reason
- Cancellation workflow:
  - Admin initiates cancellation
  - System notifies all registered members
  - auto convert to class voucher

### 5. Class Voucher System
- Voucher generation:
  - Automatic generation for cancelled classes
  - Manual generation by admin
- Voucher attributes:
  - Unique voucher code
  - Class type/category
  - Value (full class or partial credit)
  - Expiration date
  - Usage restrictions
- Voucher management:
  - Usage tracking

### 6. Voucher Expiration System
- Expiration rules:
  - Default expiration: 60 days from issue
  - Configurable expiration periods
  - Grace period for expired vouchers (admin override)
- Expiration handling:
  - Automatic deactivation
  - Option to extend (admin only)
  - Usage restrictions near expiration

### Technical Requirements
- Real-time updates for class status
- Secure payment processing
- Automated notification system
- Audit logging for all class-related actions
- Backup and recovery procedures
- Data retention policies

### User Roles and Permissions
- Member:
  - Book classes
  - Manage bookings
  - Use vouchers
  - View class history
- Class Admin:
  - Create/modify classes
  - reduce capacity
  - Handle cancellations
  - Generate vouchers


## Section Analysis 

### Pages of the feature

#### Design Approach
- Mobile-first, mobile-only design
- Maximum width: 480px (standard mobile viewport)
- Centered content on desktop with side margins
- Vertical scrolling as primary navigation
- Bottom navigation bar for main actions
- Swipe gestures for common actions
- Touch-optimized UI elements

#### 1. Class List Page (`/classes`)
**Purpose**: Display available classes in a mobile-optimized list view

**UI Components**:
- Sticky header
  - Search icon (opens search modal)
  - Filter icon (opens filter drawer)
  - Profile/notification icons
- Search modal
  - Full-screen search interface
  - Search by class name, category, instructor
  - Recent searches
  - Search suggestions
- Filter drawer (bottom sheet)
  - Category chips (horizontal scrollable)
  - Date picker (calendar view)
  - Time slots (horizontal scrollable)
  - Price range slider
  - Apply filters button
- Class cards (vertical list)
  - Class image (16:9 ratio)
  - Class name (2 lines max)
  - Category tags (horizontal scrollable)
  - Date and time
  - Price
  - Available spots
  - Book now button (full width)
- Pull to refresh
- Infinite scroll
- Bottom navigation bar
  - Home (active)
  - My Classes
  - Vouchers
  - Profile

**Functionality**:
- Swipe left/right on cards to:
  - Save to favorites
  - Share class
- Pull down to refresh
- Quick book with one tap
- Real-time availability updates
- Sort options (in filter drawer):
  - Date
  - Price
  - Popularity

**Admin Features** (if logged in as admin):
- Floating action button for:
  - Create new class
  - Quick actions menu
- Long press on class card for:
  - Edit class
  - Cancel class
  - View attendance

#### 2. Class Detail Page (`/classes/[class-id]`)
**Purpose**: Show class information and handle booking in a mobile-optimized view

**UI Components**:
- Sticky header
  - Back button
  - Share button
  - More options menu
- Hero section
  - Full-width class image
  - Class name
  - Category tags (horizontal scrollable)
  - Price and spots (sticky bar)
- Bottom sheet tabs
  1. Overview
     - Description (expandable)
     - Schedule (calendar view)
     - Location (map view)
     - Instructor info
     - Required equipment
     - Difficulty level
  2. Participants
     - Participant avatars (horizontal scrollable)
     - Capacity meter
  3. Reviews
     - Rating summary
     - Review cards
- Booking bottom sheet
  - Date picker (calendar view)
  - Time slot selection
  - Payment method selection
  - Terms checkbox
  - Book now button (full width)
- Related classes carousel
  - Horizontal scrollable cards

**Functionality**:
- Swipe between tabs
- Pinch to zoom on images
- Share via bottom sheet
- Save to favorites
- Report issue
- View in calendar
- Real-time capacity updates

**Admin Features** (if logged in as admin):
- Quick actions in more options menu:
  - Edit class
  - Cancel class
  - Manage participants
  - Generate vouchers
  - Adjust capacity

#### 3. My Classes Page (`/my-classes`)
**Purpose**: Manage user's classes and vouchers in a mobile-optimized view

**UI Components**:
- Sticky header
  - Page title
  - Filter icon
- Tab bar
  1. Upcoming
  2. Past
  3. Vouchers
- Class cards (vertical list)
  - Class image
  - Class details
  - Date and time
  - Status badge
  - Action buttons
- Voucher cards
  - Voucher code
  - Status
  - Expiration
  - Apply button
- Bottom navigation bar
  - Home
  - My Classes (active)
  - Vouchers
  - Profile

**Functionality**:
- Swipe actions on cards:
  - Cancel booking
  - Reschedule
  - View details
- Pull to refresh
- Apply voucher with one tap
- Download receipt
- Share class

#### 4. Class Management Page (`/admin/classes`) - Admin Only
**Purpose**: Mobile-optimized admin interface for class management

**UI Components**:
- Sticky header
  - Page title
  - Filter icon
  - Create new button
- Stats cards (horizontal scrollable)
  - Total classes
  - Active classes
  - Cancelled classes
  - Total participants
- Class list
  - Class cards with:
    - Status badge
    - Quick actions
    - Participant count
- Bottom sheet for:
  - Create new class
  - Bulk actions
  - Export data
- Bottom navigation bar
  - Dashboard
  - Classes (active)
  - Vouchers
  - Profile

**Functionality**:
- Swipe actions on cards
- Quick edit
- Cancel class
- View attendance
- Export data
- Send notifications

#### 5. Voucher Management Page (`/admin/vouchers`) - Admin Only
**Purpose**: Mobile-optimized voucher management interface

**UI Components**:
- Sticky header
  - Page title
  - Filter icon
  - Create voucher button
- Voucher list
  - Voucher cards with:
    - Status badge
    - Expiration
    - Assigned to
    - Quick actions
- Bottom sheet for:
  - Create voucher
  - Bulk actions
  - Export data
- Bottom navigation bar
  - Dashboard
  - Classes
  - Vouchers (active)
  - Profile

**Functionality**:
- Swipe actions on vouchers
- Generate vouchers
- Extend expiration
- Void vouchers
- Track usage
- Export data

**Common Elements Across Pages**:
- Mobile-optimized navigation
  - Bottom navigation bar
  - Swipe gestures
  - Pull to refresh
  - Bottom sheets
- Touch-friendly UI
  - Minimum touch target: 44x44px
  - Adequate spacing between elements
  - Clear visual feedback
- Loading states
  - Skeleton screens
  - Pull to refresh
  - Loading spinners
- Error handling
  - Toast messages
  - Error states
  - Retry options
- Success feedback
  - Haptic feedback
  - Success animations
  - Confirmation messages

**Technical Considerations**:
- Mobile-first CSS
- Viewport meta tag
- Touch event handling
- Gesture recognition
- Offline support
- Push notifications
- Image optimization
- Performance optimization
- Accessibility for touch
- Deep linking support
- App-like experience
- Responsive images
- Touch-friendly forms
- Mobile-optimized modals
- Bottom sheet patterns
- Pull-to-refresh
- Infinite scroll
- Skeleton loading
- Error boundaries
- Form validation
- Mobile analytics