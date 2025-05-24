# Membership Extension Feature Specification

## Overview
This feature allows active gym members to extend their membership duration by making a payment. The system will validate member eligibility, process payments, and update membership records accordingly.

## Business Requirements

### Eligibility Criteria
- Member must have `membership_status = 'active'`
- Member must be currently registered in the system
- Member account must be in good standing (no outstanding issues)

### Extension Options
- **Quarterly Extension**: 90 days  
- **Semi-Annual Extension**: 180 days
- **Annual Extension**: 360 days


## User Stories

### As an Active Member
- I want to view my current membership status and expiration date
- I want to see available extension options with pricing
- I want to select an extension duration and proceed to payment
- I want to receive confirmation of successful extension
- I want to see my updated membership expiration date

### As a Gym Administrator
- I want to track all membership extensions
- I want to see extension revenue analytics
- I want to handle failed payment scenarios
- I want to apply manual extensions when needed

## Technical Requirements

### Database Schema Changes

#### New Table: `membership_extensions`
```sql
CREATE TABLE whygym.membership_extensions (
    id integer PRIMARY KEY,
    member_id integer NOT NULL REFERENCES whygym.members(id),
    extension_days integer NOT NULL,
    extension_type varchar(20) NOT NULL, -- 'monthly', 'quarterly', 'semi-annual', 'annual'
    price numeric(10,2) NOT NULL,
    previous_end_date date NOT NULL,
    new_end_date date NOT NULL,
    order_reference_id varchar(40) REFERENCES whygym.orders(reference_id),
    status varchar(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    additional_data jsonb
);
```

#### Members Table Update
```sql
-- Add membership end date tracking
ALTER TABLE whygym.members 
ADD COLUMN membership_end_date date,
ADD COLUMN last_extension_date timestamp with time zone;
```

### API Endpoints

#### GET `/api/members/{member_id}/membership-status`
**Purpose**: Get current membership details and extension eligibility
**Response**:
```json
{
  "member_id": 123,
  "membership_status": "active",
  "membership_start_date": "2024-01-01",
  "membership_end_date": "2024-12-31",
  "days_remaining": 45,
  "eligible_for_extension": true,
  "extension_options": [
    {
      "type": "monthly",
      "days": 30,
      "price": 50.00,
      "discount_percentage": 0
    },
    {
      "type": "quarterly", 
      "days": 90,
      "price": 142.50,
      "discount_percentage": 5
    }
  ]
}
```

#### POST `/api/members/{member_id}/extend-membership`
**Purpose**: Initiate membership extension process
**Request Body**:
```json
{
  "extension_type": "quarterly",
  "payment_method": "credit_card"
}
```
**Response**:
```json
{
  "extension_id": 456,
  "member_id": 123,
  "extension_type": "quarterly",
  "extension_days": 90,
  "price": 142.50,
  "new_end_date": "2025-03-31",
  "order_reference_id": "ext_789abc",
  "payment_url": "https://payment.gateway.com/pay/ext_789abc",
  "status": "pending"
}
```

#### PUT `/api/membership-extensions/{extension_id}/status`
**Purpose**: Update extension status (webhook for payment gateway)
**Request Body**:
```json
{
  "status": "completed",
  "payment_reference": "pay_123xyz",
  "payment_timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET `/api/members/{member_id}/extension-history`
**Purpose**: Get member's extension history
**Response**:
```json
{
  "extensions": [
    {
      "id": 456,
      "extension_type": "quarterly",
      "extension_days": 90,
      "price": 142.50,
      "previous_end_date": "2024-12-31",
      "new_end_date": "2025-03-31",
      "status": "completed",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## User Experience Flow

### Member Extension Flow
1. **Login & Dashboard**: Member logs in and sees membership status widget
2. **Extension Page**: Click "Extend Membership" shows current status and options
3. **Selection**: Choose extension duration and see pricing breakdown
4. **Payment**: Redirect to payment gateway with pre-filled order details
5. **Confirmation**: Return to success page with updated membership details
6. **Email Notification**: Receive confirmation email with receipt

### Admin Management Flow
1. **Extensions Dashboard**: View all pending/completed extensions
2. **Member Lookup**: Search member and see extension history
3. **Manual Extension**: Apply manual extensions with reason tracking
4. **Revenue Analytics**: View extension revenue by period and type

## Business Logic

### Extension Calculation
- New end date = Current end date + Extension days
- If membership already expired, base calculation on current date
- Track previous end date for audit purposes

### Payment Processing
- Integration with existing payment gateway
- Use existing `orders` table for payment tracking
- Link extension record to order via `reference_id`
- Handle payment callbacks to update status

### Status Management
- **pending**: Extension created, payment not completed
- **completed**: Payment successful, membership updated
- **failed**: Payment failed, membership unchanged
- **cancelled**: Extension cancelled before payment

## Edge Cases & Error Handling

### Payment Failures
- Keep extension record with 'failed' status
- Allow retry of same extension within 24 hours
- Send email notification of payment failure

### Membership Status Changes
- If member becomes inactive during payment process, reject extension
- Handle concurrent extension attempts with database locking

### Data Consistency
- Use database transactions for membership updates
- Implement rollback for failed extension applications
- Log all extension attempts for audit trail

### Validation Rules
- Cannot extend if membership status is not 'active'
- Cannot extend if member has pending extension orders
- Cannot extend beyond system-defined maximum future date (e.g., 5 years)

## Security Considerations

### Payment Security
- Never store full payment details
- Use secure payment gateway integration
- Implement payment webhook signature validation

### Access Control
- Members can only extend their own membership
- Admins can extend any member's subscription
- Validate member ownership in API endpoints

### Data Protection
- Encrypt sensitive extension data
- Audit log all extension activities
- Implement rate limiting for extension attempts

## Monitoring & Analytics

### Key Metrics
- Extension conversion rate
- Average extension duration selected
- Revenue per extension type
- Failed payment rate

### Alerts
- High number of failed extensions
- Unusual extension patterns
- Payment gateway issues

## Integration Points

### Email Service
- Extension confirmation emails
- Payment failure notifications
- Membership expiry reminders

### Payment Gateway
- Process extension payments
- Handle webhooks for status updates
- Manage refunds if needed

### Existing Systems
- Update member records in real-time
- Integrate with existing order management
- Sync with membership status tracking

## Future Enhancements

### Phase 2 Features
- Auto-renewal subscriptions
- Family membership extensions
- Corporate bulk extensions
- Promotional discount codes

### Mobile App Integration
- Push notifications for extension reminders
- In-app purchase flow
- Offline extension queue

## Success Criteria

### Functional
- Active members can successfully extend memberships
- Payment processing works reliably
- Membership dates update correctly
- Admin tools provide necessary visibility

### Performance
- Extension process completes within 30 seconds
- Payment gateway response time < 5 seconds
- System handles 100 concurrent extensions

### Business
- 80% of eligible members use self-service extension
- 95% extension payment success rate
- Reduced manual administrative work by 70% 