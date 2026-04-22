# 🔧 Technical Implementation Details

## API Endpoints Used

### Frontend → Backend Communication

```
1. GET /api/v1/booking/userBookings/:userId
   Purpose: Fetch user's bookings
   Used in: Account → Bookings Section
   Returns: List of bookings with listing details

2. GET /api/v1/invoice/:bookingId
   Purpose: Generate and download PDF receipt
   Used in: Account Bookings + Payment Success page
   Returns: PDF file as blob

3. POST /api/v1/booking/create
   Purpose: Create new booking
   Payload: { listingId, startDate, visitDate, paymentMethod, sharingType }
   Returns: { success, booking, paymentUrl }

4. POST (Webhook) /api/v1/payment/webhook
   Purpose: Handle Stripe payment success
   Triggers: Email with receipt to user
   Updates: Booking status to "Confirmed"
```

---

## Email Templates Flow

### Template 1: Booking Created (Before Payment)

**Trigger**: When user clicks "Book Now" and payment is needed

```
TO: user@email.com
SUBJECT: ⏳ Complete Your Payment - Booking Request Received 🏠

CONTENT:
├─ Greeting with user name
├─ Property details (title, location, contact)
├─ Amount to pay
├─ CTA Button: "Complete Payment" (links to Stripe)
└─ Expiration warning
```

**Trigger**: When user books "Visit" (no payment)

```
TO: user@email.com
SUBJECT: ✅ Booking Confirmed - Visit Scheduled 🎉

CONTENT:
├─ Greeting with user name
├─ Property details
├─ Scheduled visit date
├─ Move-in date
└─ Note: Property manager will contact
```

---

### Template 2: Payment Success (With Receipt)

**Trigger**: Stripe webhook → Payment confirmed

```
TO: user@email.com
SUBJECT: 🎉 Your Booking is Confirmed! Receipt Attached

CONTENT:
├─ Success icon + "Booking Confirmed!" heading
├─ User name greeting
├─ Property card with details
├─ Payment summary table:
│  ├─ Total price
│  ├─ Amount paid
│  ├─ Due amount (if applicable)
│  └─ Payment status
├─ Amount paid display (highlighted)
├─ Important notes
└─ PDF Receipt ATTACHMENT ✉️📎
```

---

## Data Flow Diagram

```
USER INTERFACE
    ↓
┌───────────────────────────────────────────┐
│  Booking Page / Modal                     │
│  (Shows all PG details)                   │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  Click "Book Now"                         │
│  POST /api/v1/booking/create              │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  BACKEND: Check if payment needed         │
├───────────────────────────────────────────┤
│  If Payment Needed:                       │
│  ├─ Create Booking (status: Pending)      │
│  ├─ Create Stripe Session                 │
│  ├─ Send Email (Payment Link)             │
│  └─ Return paymentUrl                     │
│                                           │
│  If Visit Only:                           │
│  ├─ Create Booking (status: Confirmed)    │
│  ├─ Send Email (Visit Confirmation)       │
│  └─ Return success message                │
└───────────────────────────────────────────┘
    ↓
┌───────────────────────────────────────────┐
│  FRONTEND: Redirect to Stripe OR Success  │
└───────────────────────────────────────────┘
    ↓
    If Payment:
    ├─ User completes Stripe checkout
    └─ Stripe sends webhook to backend
       ↓
       ┌─────────────────────────────────┐
       │ WEBHOOK HANDLER                 │
       ├─────────────────────────────────┤
       │ ✓ Mark booking as Confirmed     │
       │ ✓ Generate PDF Receipt          │
       │ ✓ Send Email with PDF           │
       │ ✓ Create Invoice record         │
       └─────────────────────────────────┘
       ↓
       ┌─────────────────────────────────┐
       │ User receives email with PDF    │
       └─────────────────────────────────┘
    
    ↓ (Payment Success Page)
    ├─ Show confirmation message
    ├─ Display download button (stays)
    ├─ Poll for invoice ready status
    └─ Allow manual retry
```

---

## State Management (Frontend)

### BookingsSection.jsx States

```javascript
State Variables:
├─ bookings: Array of user's bookings
├─ loading: Boolean (fetching bookings)
├─ error: String (error message)
├─ selectedBooking: Object (booking in modal)
├─ showModal: Boolean (modal visibility)
└─ downloading: Boolean (receipt download status)

Functions:
├─ fetchBookings() - Get bookings from API
├─ handleViewDetails(booking) - Open modal
├─ handleDownloadReceipt(bookingId) - Download PDF
└─ getStatusColor(status) - Color coding for status
```

### Payment.jsx States

```javascript
State Variables:
├─ bookingId: String (from URL params)
├─ loading: Boolean (checking invoice)
├─ downloading: Boolean (PDF download)
└─ ready: Boolean (invoice is ready)

Effects:
└─ Auto-check invoice availability (5 attempts)
```

---

## Error Handling

### Frontend Error Cases

```
1. Receipt download fails
   → Show alert: "Receipt not available yet"
   → User can retry later

2. Modal opens but listing data missing
   → Show "N/A" for missing fields
   → Graceful degradation

3. Payment success page but invoice delayed
   → Show loading spinner
   → Retry button appears after timeout
   → User can manually retry
```

### Backend Error Cases

```
1. Listing not found
   → Return 404 with message
   
2. User not authenticated
   → Return 401
   
3. Stripe error
   → Catch and return error details
   → Don't create booking

4. Email send fails
   → Log error but don't fail booking
   → Booking still created successfully
```

---

## Security Features

### Authentication
```
✓ Bookings require user login
✓ Users can only see their own bookings
✓ Stripe webhook signature verification
✓ Booking ID used in URLs (not email)
```

### Data Protection
```
✓ PDF files generated server-side
✓ No PII in URLs
✓ Email validated before sending
✓ Webhook validation via signature
```

---

## Performance Optimizations

### Frontend
```
✓ Modal lazy loads (not rendered until opened)
✓ Images optimized in property cards
✓ PDF download uses Blob (memory efficient)
✓ Auto-polling with max attempt limit
```

### Backend
```
✓ PDF generated on-demand
✓ Invoice cached after creation
✓ Webhook processed asynchronously
✓ Email sent in background
```

---

## Browser Compatibility

```
✓ Chrome/Edge 90+
✓ Firefox 88+
✓ Safari 14+
✓ Mobile Safari (iOS 14+)
✓ Android Chrome 90+
```

---

## Testing Scenarios

### Scenario 1: Full Payment Flow
```
1. User books property with "Full Payment"
2. Redirected to Stripe
3. Complete payment
4. Webhook triggers
5. Email sent with receipt
6. Can download from success page
7. Can download from Account later
```

### Scenario 2: Token Payment Flow
```
1. User books property with "Token (10%)"
2. Pay 10% via Stripe
3. Email shows remaining amount due at property
4. Receipt shows payment split
5. Can download receipt from Account
```

### Scenario 3: Visit Only Flow
```
1. User books "Book Visit"
2. No payment needed
3. Email confirms visit date
4. Can download "confirmation" as reference
5. Property manager contacts user
```

---

## Responsive Breakpoints

```
Desktop:  1024px+
  ├─ Full modal
  ├─ Side by side details
  └─ All features visible

Tablet:   768px - 1023px
  ├─ Adjusted modal width
  ├─ Stacked amenities
  └─ Touch-friendly buttons

Mobile:   320px - 767px
  ├─ Full-width modal
  ├─ Vertical details table
  ├─ Larger touch targets
  └─ Optimized spacing
```

---

## Future Enhancement Possibilities

```
1. Email previews in Account dashboard
2. Receipt sharing via WhatsApp/Telegram
3. Invoice customization options
4. Booking status history/timeline
5. SMS notifications
6. Multiple receipt formats (JSON, XML)
7. Auto-resend receipt functionality
8. Admin dashboard for booking management
9. Payment reconciliation reports
10. Booking comments/notes system
```

---

**Last Updated**: April 22, 2026
**Version**: 1.0
**Status**: Production Ready ✅
