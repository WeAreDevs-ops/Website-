import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [seller, setSeller] = useState(null);
  const [sellerLogin, setSellerLogin] = useState({ username: '', password: '' });
  const [formType, setFormType] = useState('account');

  // Account form state
  const [formData, setFormData] = useState({
    username: '',
    totalSummary: '',
    email: 'Verified',
    price: '',
    mop: 'Gcash',
    robuxBalance: '',
    limitedItems: '',
    inventory: 'Public',
    gamepass: '',
    accountType: 'Global Account',
    premium: 'False',
    facebookLink: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Robux listing state
  const [robuxListings, setRobuxListings] = useState([]);
  const [robuxFormData, setRobuxFormData] = useState({
    amount: '',
    via: '',
    price: '',
    contact: ''
  });
  const [robuxEditMode, setRobuxEditMode] = useState(false);
  const [robuxEditId, setRobuxEditId] = useState(null);
  const [isRobuxSubmitting, setIsRobuxSubmitting] = useState(false);

  const isSeller = !!seller;

  // ✅ Limited item listing state
  const [limitedFormData, setLimitedFormData] = useState({ assetId: '', contactLink: '' });
  const [limitedItem, setLimitedItem] = useState(null);
  const [isFetchingLimited, setIsFetchingLimited] = useState(false);

  // Load seller from localStorage on mount
  useEffect(() => {
    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) setSeller(JSON.parse(storedSeller));
  }, []);

  // Fetch accounts and robux listings on login state change
  useEffect(() => {
    if (isAuthorized || isSeller) {
      fetchAccounts();
      fetchRobuxListings();
    }
  }, [isAuthorized, seller]);

  // Fetch accounts API call
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (isSeller) {
        const username = seller?.username;
        setAccounts(data.accounts.filter(acc => acc.seller === username));
      } else {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  // Fetch robux listings API call
  const fetchRobuxListings = async () => {
    try {
      const res = await fetch('/api/robux');
      const data = await res.json();
      if (res.ok) {
        if (isSeller) {
          const username = seller?.username;
          setRobuxListings(data.robuxList.filter(item => item.seller === username));
        } else {
          setRobuxListings(data.robuxList);
        }
      }
    } catch (error) {
      console.error('Failed to fetch robux listings:', error);
    }
  };

  // Admin login handler
  const handleAdminLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (response.ok) {
        setIsAuthorized(true);
        Swal.fire('Access Granted', 'Welcome admin!', 'success');
      } else {
        Swal.fire('Access Denied', 'Invalid admin password!', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to login!', 'error');
    }
  };

  // Seller login handler
  const handleSellerLogin = async (e) => {
    e.preventDefault();
    const { username, password } = sellerLogin;

    if (!username || !password) {
      Swal.fire('Missing Fields', 'Please enter both username and password.', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/seller-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Welcome!', 'Seller login successful', 'success');
        const sellerData = { username: username.trim() };
        localStorage.setItem('seller', JSON.stringify(sellerData));
        setSeller(sellerData);
      } else {
        Swal.fire('Login Failed', data.error || 'Invalid login', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('seller');
    setSeller(null);
    setIsAuthorized(false);
    setAccounts([]);
    setRobuxListings([]);
    Swal.fire('Logged out', 'You have been logged out.', 'success');
  };

  // Account form input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Account form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    // ... rest unchanged ...
  };

  // Account delete, edit etc remain unchanged...
  
  // Robux form input change handler
  const handleRobuxChange = (e) => {
    const { name, value } = e.target;
    setRobuxFormData(prev => ({ ...prev, [name]: value }));
  };

  // Robux submit, edit, delete logic unchanged...

  // ✅ Limited item helpers
  const handleLimitedChange = (e) => {
    const { name, value } = e.target;
    setLimitedFormData(prev => ({ ...prev, [name]: value }));
  };

  const getAssetTypeName = (typeId) => {
    const types = {
      1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 8: "Hat", 11: "Shirt", 12: "Pants",
      18: "Face", 19: "Gear", 32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
      43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
      46: "Back Accessory", 47: "Waist Accessory"
    };
    return types[typeId] || "Unknown";
  };

  const fetchLimitedItem = async () => {
    const { assetId } = limitedFormData;
    if (!assetId) return alert("Please enter an Asset ID");
    setIsFetchingLimited(true);
    try {
      const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
      const details = await detailsRes.json();
      const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
      const thumbData = await thumbRes.json();
      const thumbnail = thumbData.data[0]?.imageUrl || '';
      const resale = details.CollectiblesItemDetails?.CollectibleLowestResalePrice;
      setLimitedItem({
        name: details.Name,
        thumbnail,
        creator: details.Creator?.Name || 'N/A',
        resale,
        resaleText: resale ? `${resale.toLocaleString()} Robux` : 'Offsale',
        resalePHP: resale ? `₱${(resale * 0.15).toLocaleString()}` : 'N/A',
        type: getAssetTypeName(details.AssetTypeId),
        isLimited: details.IsLimited,
        isLimitedUnique: details.IsLimitedUnique
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch item details.', 'error');
    } finally {
      setIsFetchingLimited(false);
    }
  };

  // Render login or main panel
  if (!isAuthorized && !seller) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2 style={{ color: 'white' }}>Admin Login</h2>
        {/* ... unchanged login form ... */}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2 style={{ color: 'white' }}>
        {isAuthorized ? 'Admin Panel' : `${seller?.username}'s Panel`}
        <button onClick={handleLogout} style={{ marginLeft: '20px', background: 'red', color: '#fff' }}>Logout</button>
      </h2>

      {/* === FORM TOGGLE BUTTONS === */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button onClick={() => setFormType('account')} style={/* unchanged styles */}>ACCOUNT LISTING FORM</button>
        <button onClick={() => setFormType('robux')} style={/* unchanged styles */}>ROBUX LISTING FORM</button>
        <button onClick={() => setFormType('limited')} style={{
          padding: '10px 20px',
          backgroundColor: formType === 'limited' ? '#9C27B0' : '#e0e0e0',
          color: formType === 'limited' ? 'white' : 'black',
          border: 'none',
          borderRadius: '5px'
        }}>LIMITED ITEM LISTING FORM</button>
      </div>

      {/* === ACCOUNT FORM SECTION === */}
      {formType === 'account' && (
        <>
          {/* ... your entire account form and listing logic, untouched ... */}
        </>
      )}

      {/* === ROBUX FORM SECTION === */}
      {formType === 'robux' && (
        <>
          {/* ... your entire robux form and listing logic, untouched ... */}
        </>
      )}

      {/* === LIMITED ITEM LISTING SECTION === */}
      {formType === 'limited' && (
        <div style={{ color: 'white' }}>
          <h3>Limited Item Listing</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Asset ID:</label>
            <input
              type="text"
              name="assetId"
              value={limitedFormData.assetId}
              onChange={handleLimitedChange}
            />
            <button onClick={fetchLimitedItem} disabled={isFetchingLimited}>
              {isFetchingLimited ? 'Fetching...' : 'Fetch Item'}
            </button>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Contact Link:</label>
            <input
              type="text"
              name="contactLink"
              value={limitedFormData.contactLink}
              onChange={handleLimitedChange}
            />
          </div>
          {limitedItem && (
            <div style={{ marginTop: '20px' }}>
              <h4>{limitedItem.name}</h4>
              <img src={limitedItem.thumbnail} alt="Thumbnail" width="200" />
              <p><strong>Creator:</strong> {limitedItem.creator}</p>
              <p><strong>Lowest Resale:</strong> {limitedItem.resaleText}</p>
              <p><strong>PHP Equivalent:</strong> {limitedItem.resalePHP}</p>
              <p><strong>Type:</strong> {limitedItem.type}</p>
              <p><strong>Is Limited:</strong> {limitedItem.isLimited ? '✅' : '❌'}</p>
              <p><strong>Is Limited Unique:</strong> {limitedItem.isLimitedUnique ? '✅' : '❌'}</p>
              <p><strong>Contact:</strong> <a href={limitedFormData.contactLink} target="_blank" rel="noopener noreferrer">{limitedFormData.contactLink}</a></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
  
