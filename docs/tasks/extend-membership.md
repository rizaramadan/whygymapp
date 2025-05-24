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


## User Experience Flow


### Step 2: Extension Duration Selection
2.1. Display page header: "Extend Your Membership" at url /member-extend/request
2.2. Show current membership information:
    - Current membership type
    - Current expiration date
    - Days remaining
2.3. Present three extension options with clear pricing:
    - **90 Days (Quarterly)**: $X.XX - New expiration: [calculated date]
    - **180 Days (Semi-Annual)**: $X.XX - New expiration: [calculated date]  
    - **360 Days (Annual)**: $X.XX - New expiration: [calculated date]
2.4. Include promotional messaging or discounts if applicable
2.5. User selects one option via radio buttons or cards
2.6. "Continue" button becomes active after selection
2.7. Form validation ensures one option is selected before proceeding

### Step 3: Order Summary & Payment Method Selection
**URL: `/member-extend/checkout`**

3.1. Display comprehensive order summary:
    - Selected extension duration
    - Price breakdown (base price, taxes, fees)
    - Current membership expiration
    - New membership expiration date
    - Total amount due
3.2. Show available payment methods:
    - Credit/Debit Card
    - Bank Transfer (if supported)
    - Digital Wallets (PayPal, Apple Pay, etc.)
    - Stored payment methods (if user has saved cards)
3.3. Display terms and conditions checkbox
3.4. Include cancellation/refund policy information
3.5. "Proceed to Payment" button (disabled until payment method selected and terms accepted)

### Step 4: Payment Processing
**URL: `/member-extend/process`** (internal processing)

4.1. Validate form inputs and selected options
4.2. If validation fails:
    - Display error messages inline
    - Highlight problematic fields
    - Keep user on current page
4.3. If validation passes:
    - Show loading indicator
    - Create payment session/order in system
    - Redirect to payment gateway with:
      - Order ID
      - Amount
      - Member details
      - Return URLs (success/failure/cancel)

### Step 5: Payment Gateway Interaction
**URL: External payment gateway** (third-party URL)

5.1. User interacts with third-party payment interface
5.2. Possible outcomes:
    - **Success**: Payment processed successfully
    - **Failure**: Payment declined or failed
    - **Cancelled**: User cancels payment process
    - **Timeout**: Session expires

### Step 6: Payment Gateway Callback Processing
**URL: `/member-extend/callback`** (webhook endpoint)

6.1. Payment gateway sends webhook/callback to system
6.2. System validates callback authenticity and payment status
6.3. **For successful payments**:
    - Update member's expiration date in database
    - Create payment record with transaction details
    - Generate receipt/invoice
    - Send confirmation email to member
    - Log transaction for audit purposes
6.4. **For failed payments**:
    - Log failure reason
    - Update order status to 'failed'
    - Prepare user-friendly error message

### Step 7: User Return & Result Display
**URLs:**
- Success: `/member-extend/success`
- Failure: `/member-extend/failed` 
- Cancelled: `/member-extend/cancelled`

7.1. **Success Flow**:
    - Redirect to success page (`/member-extend/success`)
    - Display confirmation message with:
      - Extension details (duration, new expiration date)
      - Payment confirmation number
      - Receipt download link
      - Updated membership card/QR code
    - Provide navigation back to member dashboard
7.2. **Failure Flow**:
    - Redirect to failure page (`/member-extend/failed`)
    - Display error message explaining what went wrong
    - Offer options to:
      - Retry payment with same selection
      - Choose different payment method
      - Contact support for assistance
7.3. **Cancelled Flow**:
    - Redirect back to extension selection page (`/member-extend/request`)
    - Display message: "Payment was cancelled. Your membership was not extended."
    - Allow user to restart process

### Step 8: Post-Transaction Updates
**Backend processes** (no specific user-facing URL)

8.1. Update member dashboard to reflect new expiration date
8.2. Update gym access systems with new membership validity
8.3. Send automated email with:
    - Extension confirmation
    - Updated membership details
    - PDF receipt attachment
8.4. Update member's mobile app (if applicable)
8.5. Create audit trail entry for the transaction

### Error Handling & Edge Cases
- **Network connectivity issues**: Display retry options and offline message
- **Payment gateway unavailable**: Show maintenance message and alternative contact methods
- **Duplicate payment attempts**: Prevent double-charging with idempotency checks
- **Session timeout**: Save form progress and allow resumption after re-authentication
- **Invalid membership during process**: Real-time validation and graceful error handling