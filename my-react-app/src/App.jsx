import { useState, useEffect } from 'react';
import './App.css';

// Initial mock data
const initialTanks = [
  { id: "tank-1", name: "Main Planted Tank", volume: "180L", pH: 6.8, temp: 24, status: "Healthy" },
  { id: "tank-2", name: "Shrimp Nano Cube", volume: "30L", pH: 7.2, temp: 22, status: "Warning" }
];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [tanks, setTanks] = useState(() => {
    const savedTanks = localStorage.getItem('aquaflow_tanks');
    return savedTanks ? JSON.parse(savedTanks) : initialTanks;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State (Used for both Create and Update)
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    volume: '',
    pH: '',
    temp: '',
    status: 'Healthy'
  });

  // --- PERSISTENCE (Syncing with LocalStorage Database) ---
  useEffect(() => {
    localStorage.setItem('aquaflow_tanks', JSON.stringify(tanks));
  }, [tanks]);

  // --- HANDLERS (CRUD Operations) ---

  // Handle Input Changes dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // CREATE & UPDATE handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.volume) {
      alert("Please fill out the Tank Name and Volume.");
      return;
    }

    if (isEditing) {
      // UPDATE: Replaces the matching item in array
      setTanks(tanks.map(tank => tank.id === formData.id ? formData : tank));
      setIsEditing(false);
    } else {
      // CREATE: Uses crypto.randomUUID() for a pure, unique string ID
      const newTank = {
        ...formData,
        // eslint-disable-next-line react-hooks/purity
        id: crypto.randomUUID ? crypto.randomUUID() : `tank-${Math.random().toString(36).substr(2, 9)}`,
        pH: parseFloat(formData.pH) || 7.0,
        temp: parseFloat(formData.temp) || 24
      };
      setTanks([...tanks, newTank]);
    }

    clearForm();
  };

  // EDIT TRIGGER (Populates form fields)
  const handleEdit = (tank) => {
    setIsEditing(true);
    setFormData(tank);
  };

  // DELETE handler
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this tank profile?")) {
      setTanks(tanks.filter(tank => tank.id !== id));
      if (formData.id === id) clearForm(); 
    }
  };

  const clearForm = () => {
    setFormData({ id: null, name: '', volume: '', pH: '', temp: '', status: 'Healthy' });
    setIsEditing(false);
  };

  // --- FILTER LOGIC (Live Search) ---
  const filteredTanks = tanks.filter(tank =>
    tank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <h1>Aquaflow 🌊</h1>
        <p>Smart Aquarium Profile & Parameter Tracker</p>
      </header>

      <main className="dashboard-content">
        {/* LEFT COLUMN: FORM COMPONENT (Create / Update) */}
        <section className="form-section">
          <h2>{isEditing ? "✏️ Edit Tank Profile" : "➕ Add New Tank"}</h2>
          <form onSubmit={handleSubmit} className="tank-form">
            <div className="form-group">
              <label>Tank Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="e.g., Amazonian Riparium" 
              />
            </div>

            <div className="form-group">
              <label>Volume (e.g., 120L, 55 Gal)</label>
              <input 
                type="text" 
                name="volume" 
                value={formData.volume} 
                onChange={handleInputChange} 
                placeholder="e.g., 120L" 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>pH Level</label>
                <input 
                  type="number" 
                  step="0.1" 
                  name="pH" 
                  value={formData.pH} 
                  onChange={handleInputChange} 
                  placeholder="7.0" 
                />
              </div>
              <div className="form-group">
                <label>Temp (°C)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  name="temp" 
                  value={formData.temp} 
                  onChange={handleInputChange} 
                  placeholder="25" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Healthy">🟢 Healthy</option>
                <option value="Warning">🟡 Warning (Action Needed)</option>
                <option value="Critical">🔴 Critical Alert</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {isEditing ? "Save Changes" : "Add Tank"}
              </button>
              {isEditing && (
                <button type="button" className="btn-cancel" onClick={clearForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* RIGHT COLUMN: DISPLAY COMPONENT (Read / Search / Delete) */}
        <section className="display-section">
          <div className="search-bar-container">
            <input 
              type="text" 
              placeholder="🔍 Search tanks by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <h2>Active Ecosystems ({filteredTanks.length})</h2>

          {filteredTanks.length === 0 ? (
            <p className="no-data">No aquariums found. Add one to get started!</p>
          ) : (
            <div className="tank-grid">
              {filteredTanks.map((tank) => (
                <div key={tank.id} className={`tank-card status-${tank.status.toLowerCase()}`}>
                  <div className="card-header">
                    <h3>{tank.name}</h3>
                    <span className="tank-volume">{tank.volume}</span>
                  </div>
                  
                  <div className="card-stats">
                    <p>🧪 <strong>pH:</strong> {tank.pH}</p>
                    <p>🌡️ <strong>Temp:</strong> {tank.temp}°C</p>
                    <p>⚠️ <strong>Status:</strong> {tank.status}</p>
                  </div>

                  <div className="card-actions">
                    <button onClick={() => handleEdit(tank)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(tank.id)} className="btn-delete">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}