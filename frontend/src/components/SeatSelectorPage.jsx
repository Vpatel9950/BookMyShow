import React, { useEffect, useState } from 'react';
import { seatSelectorStyles } from '../assets/dummyStyles';
import { ArrowLeft, CreditCard, Sofa, Ticket, QrCode, Building2, CheckCircle2, Lock, Sparkles, X, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getShowById } from '../api/showApi';
import { createBooking, confirmBooking } from '../api/bookingApi';
import { createRazorpayOrder } from '../api/paymentApi';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SeatSelectorPage = () => {
  const { id, slot } = useParams();
  const showId = Number(slot || id);
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Payment Modal States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'netbanking', 'razorpay'
  const [cardForm, setCardForm] = useState({
    cardNumber: '4012 0000 0000 0002',
    cardName: 'Vishal Patel',
    expiry: '12/30',
    cvv: '123',
  });
  const [selectedBank, setSelectedBank] = useState('SBI');

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const data = await getShowById(showId);
        setShow(data);
        setSeats(data.seats || []);
      } catch (err) {
        toast.error('Failed to load show seats: ' + err.message);
        setTimeout(() => navigate('/movies'), 1000);
      } finally {
        setLoading(false);
      }
    };
    if (showId) fetchShowDetails();
  }, [showId, navigate]);

  const toggleSeat = (seatObj) => {
    if (seatObj.status !== 'AVAILABLE') {
      toast.info(`Seat ${seatObj.seat?.seatNumber} is ${seatObj.status}`);
      return;
    }
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatObj.id)) next.delete(seatObj.id);
      else next.add(seatObj.id);
      return next;
    });
  };

  const clearSelection = () => setSelectedSeatIds(new Set());

  const handleOpenPaymentModal = () => {
    if (selectedSeatIds.size === 0) {
      toast.error('Please select at least one seat.');
      return;
    }

    const authJson = localStorage.getItem('cine_auth');
    if (!authJson) {
      toast.error('Please login to complete your booking.');
      navigate('/login');
      return;
    }

    setPaymentModalOpen(true);
  };

  // Direct Express Project Payment Execution
  const executeDirectPayment = async () => {
    const authJson = localStorage.getItem('cine_auth');
    const user = authJson ? JSON.parse(authJson) : null;
    if (!user || !user.id) {
      toast.error('User session expired. Please login again.');
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);
      const bookingReq = {
        userId: user.id,
        showId: show.id,
        seatIds: Array.from(selectedSeatIds),
        paymentMethod: paymentMethod.toUpperCase(),
      };

      // 1. Create Pending Booking
      const pendingBooking = await createBooking(bookingReq);

      // 2. Simulate 1-sec smooth payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Confirm Booking in Backend & Dispatch Email
      const confirmedBooking = await confirmBooking(pendingBooking.id);

      toast.success('🎉 Payment Successful! Ticket confirmed & email receipt sent.');
      setPaymentModalOpen(false);
      navigate('/booking-success', { state: { booking: confirmedBooking } });
    } catch (err) {
      toast.error('Payment failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Optional Razorpay Gateway Execution
  const executeRazorpayPayment = async () => {
    const authJson = localStorage.getItem('cine_auth');
    const user = authJson ? JSON.parse(authJson) : null;
    if (!user || !user.id) {
      toast.error('User session expired. Please login again.');
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);
      const bookingReq = {
        userId: user.id,
        showId: show.id,
        seatIds: Array.from(selectedSeatIds),
        paymentMethod: 'RAZORPAY',
      };

      const pendingBooking = await createBooking(bookingReq);
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error('Failed to load Razorpay SDK.');
        setProcessing(false);
        return;
      }

      const rzpOrder = await createRazorpayOrder(pendingBooking.id, pendingBooking.totalAmount);
      const options = {
        key: rzpOrder.keyId || 'rzp_test_S3OTgBs305vzsD',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: 'CineDuniya BookMyShow',
        description: `Movie Ticket Booking #${pendingBooking.bookingNumber}`,
        order_id: rzpOrder.orderId,
        handler: async function () {
          try {
            const confirmedBooking = await confirmBooking(pendingBooking.id);
            toast.success('🎉 Booking Confirmed!');
            setPaymentModalOpen(false);
            navigate('/booking-success', { state: { booking: confirmedBooking } });
          } catch (err) {
            toast.error('Confirmation failed: ' + err.message);
          }
        },
        prefill: {
          name: user.name || 'User',
          email: user.email || 'user@example.com',
          contact: user.phoneNumber || '9876543210',
        },
        theme: { color: '#ef4444' },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        toast.error('Payment failed: ' + resp.error.description);
        setProcessing(false);
      });
      razorpayInstance.open();
    } catch (err) {
      toast.error('Razorpay Error: ' + err.message);
      setProcessing(false);
    }
  };

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.has(s.id));
  const totalAmount = selectedSeatsList.reduce((sum, s) => sum + (s.price || 250), 0);

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading seat matrix...</div>;
  }

  // Group seats by row letter (e.g. A, B, C, D, E)
  const rowsMap = {};
  seats.forEach((seatObj) => {
    const numStr = seatObj.seat?.seatNumber || 'A1';
    const rowLetter = numStr.charAt(0);
    if (!rowsMap[rowLetter]) rowsMap[rowLetter] = [];
    rowsMap[rowLetter].push(seatObj);
  });

  const rowKeys = Object.keys(rowsMap).sort();

  return (
    <div className={seatSelectorStyles.pageContainer}>
      <style>{seatSelectorStyles.customCSS}</style>

      <div className={seatSelectorStyles.mainContainer}>
        <div className={seatSelectorStyles.headerContainer}>
          <button onClick={() => navigate(-1)} className={seatSelectorStyles.backButton}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className={seatSelectorStyles.titleContainer}>
            <h1 className={seatSelectorStyles.movieTitle}>{show?.movie?.title}</h1>
            <div className={seatSelectorStyles.showtimeText}>
              {show?.screen?.theater?.name} ({show?.screen?.name}) •{' '}
              {show?.startTime ? new Date(show.startTime).toLocaleString('en-IN') : ''}
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className={seatSelectorStyles.screenContainer}>
          <div
            className={seatSelectorStyles.screen}
            style={{
              transform: 'perspective(120px) rotateX(6deg)',
              maxWidth: 900,
              boxShadow: '0 0 40px rgba(220, 38, 38, 0.18)',
            }}
          >
            <div className={seatSelectorStyles.screenText}>CINEMA SCREEN</div>
            <div className={seatSelectorStyles.screenSubtext}>All eyes on screen</div>
          </div>
        </div>

        {/* Seat Grid */}
        <div className={seatSelectorStyles.mainContent}>
          <div className={seatSelectorStyles.seatGridContainer}>
            {rowKeys.map((rowKey) => {
              const rowSeats = rowsMap[rowKey];
              return (
                <div key={rowKey} className={seatSelectorStyles.rowContainer}>
                  <div className={seatSelectorStyles.rowHeader}>
                    <div className={seatSelectorStyles.rowLabel}>{rowKey}</div>
                    <div className="flex-1 flex justify-center">
                      <div className={seatSelectorStyles.seatGrid}>
                        {rowSeats.map((seatObj) => {
                          const isBooked = seatObj.status !== 'AVAILABLE';
                          const isSelected = selectedSeatIds.has(seatObj.id);
                          const seatNum = seatObj.seat?.seatNumber;

                          let cls = seatSelectorStyles.seatButton;
                          if (isBooked) cls += ` ${seatSelectorStyles.seatButtonBooked}`;
                          else if (isSelected) cls += ` ${seatSelectorStyles.seatButtonSelectedStandard}`;
                          else cls += ` ${seatSelectorStyles.seatButtonAvailableStandard}`;

                          return (
                            <button
                              key={seatObj.id}
                              onClick={() => toggleSeat(seatObj)}
                              disabled={isBooked}
                              className={cls}
                              title={`Seat ${seatNum} - ₹${seatObj.price}`}
                            >
                              <div className={seatSelectorStyles.seatContent}>
                                <Sofa size={14} className={seatSelectorStyles.seatIcon} />
                                <div className={seatSelectorStyles.seatNumber}>{seatNum}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Booking Summary */}
          <div className={seatSelectorStyles.summaryGrid}>
            <div className={seatSelectorStyles.summaryContainer}>
              <h3 className={seatSelectorStyles.summaryTitle}>
                <Ticket size={18} /> Booking Summary
              </h3>
              <div className="space-y-4">
                <div className={seatSelectorStyles.summaryItem}>
                  <span className={seatSelectorStyles.summaryLabel}>Selected Seats:</span>
                  <span className={seatSelectorStyles.summaryValue}>{selectedSeatIds.size}</span>
                </div>

                {selectedSeatIds.size > 0 && (
                  <>
                    <div className={seatSelectorStyles.selectedSeatsContainer}>
                      <div className={seatSelectorStyles.selectedSeatsList}>
                        {selectedSeatsList.map((s) => (
                          <span key={s.id} className={seatSelectorStyles.selectedSeatBadge}>
                            {s.seat?.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={seatSelectorStyles.totalContainer}>
                      <div className={seatSelectorStyles.pricingRow}>
                        <span className={seatSelectorStyles.totalLabel}>Total Amount:</span>
                        <span className={seatSelectorStyles.totalValue}>₹{totalAmount}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className={seatSelectorStyles.actionButtons}>
                  <button
                    onClick={clearSelection}
                    disabled={selectedSeatIds.size === 0}
                    className={seatSelectorStyles.clearButton}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleOpenPaymentModal}
                    disabled={selectedSeatIds.size === 0}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-red-600/30 text-sm"
                  >
                    <Lock size={16} />
                    <span>Proceed to Payment (₹{totalAmount})</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={seatSelectorStyles.pricingContainer}>
              <h3 className={seatSelectorStyles.pricingTitle}>
                <ShieldCheck size={18} className="text-emerald-400" /> Guaranteed Ticket Booking
              </h3>
              <p className="text-xs text-neutral-400">
                Instant confirmation. Formal ticket receipt sent directly to your registered email upon checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Built-in Project Payment Gateway Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative text-white">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition p-1 rounded-full bg-neutral-800"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Express Payment Gateway</h2>
                <p className="text-xs text-neutral-400">Project Demo Checkout • Total: <strong className="text-emerald-400 font-bold">₹{totalAmount}</strong></p>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === 'card' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CreditCard size={16} /> Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === 'upi' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <QrCode size={16} /> UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === 'netbanking' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Building2 size={16} /> Banking
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === 'razorpay' ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles size={16} /> Razorpay
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4">
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Valid Thru</label>
                      <input
                        type="text"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 text-center font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardForm.cardName}
                      onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="text-center py-2 space-y-3">
                  <div className="w-36 h-36 bg-white rounded-2xl p-2 mx-auto flex items-center justify-center shadow-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=cineduniya@upi%26pn=CineDuniya%26am=${totalAmount}`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-300">Scan QR Code with Google Pay / PhonePe / Paytm</p>
                    <p className="text-[10px] text-neutral-500 font-mono">UPI ID: cineduniya@upi</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase text-neutral-400">Select Bank</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-left font-medium transition ${
                          selectedBank === b
                            ? 'border-red-500 bg-red-950/40 text-white font-bold'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'razorpay' && (
                <div className="text-center py-4 space-y-2">
                  <Sparkles size={32} className="text-blue-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Razorpay External Gateway</p>
                  <p className="text-[10px] text-neutral-400">Launches Razorpay checkout popup window.</p>
                </div>
              )}
            </div>

            {/* Action Pay Button */}
            {paymentMethod === 'razorpay' ? (
              <button
                onClick={executeRazorpayPayment}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm"
              >
                {processing ? 'Launching Razorpay...' : `Pay ₹${totalAmount} via Razorpay`}
              </button>
            ) : (
              <button
                onClick={executeDirectPayment}
                disabled={processing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing Payment...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Complete Payment (₹{totalAmount})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelectorPage;
