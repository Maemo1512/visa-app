import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [openModal, setOpenModal] = useState(false);
  const [sortMode, setSortMode] = useState("newest");

  const [preview, setPreview] = useState({
    passport: null,
    visa: null,
  });

  const [newId, setNewId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    visa_expiry: "",
    branch: "",
    passport_image: null,
    visa_image: null,
  });

 const API = "https://visa-app-3w2g.onrender.com";

  /* ================= FETCH ================= */
  const fetchGuests = async () => {
    const res = await axios.get(`${API}/guests`);
    const sorted = (res.data || []).sort((a, b) => b.id - a.id);
    setGuests(sorted);
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    setFormData((prev) => ({ ...prev, [name]: file }));

    setPreview((prev) => ({
      ...prev,
      [name === "passport_image" ? "passport" : "visa"]:
        file ? URL.createObjectURL(file) : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("visa_expiry", formData.visa_expiry);
    data.append("branch", formData.branch);

    if (formData.passport_image)
      data.append("passport_image", formData.passport_image);

    if (formData.visa_image)
      data.append("visa_image", formData.visa_image);

    const res = await axios.post(`${API}/guests`, data);

    setFormData({
      name: "",
      visa_expiry: "",
      branch: "",
      passport_image: null,
      visa_image: null,
    });

    setPreview({ passport: null, visa: null });
    setOpenModal(false);
    fetchGuests();

    if (res.data?.id) {
      setNewId(res.data.id);
      setTimeout(() => setNewId(null), 2000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this guest?")) return;
    await axios.delete(`${API}/guests/${id}`);
    fetchGuests();
  };

  /* ================= STATUS ================= */
  const getStatus = (date) => {
    if (!date) return "valid";

    const diff = Math.ceil(
      (new Date(date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (diff < 0) return "expired";
    if (diff <= 7) return "soon";
    return "valid";
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /* ================= FILTER + SORT (FIXED) ================= */
  const filtered = (guests || [])
    .filter((g) => {
      const matchSearch =
        (g.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.branch || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === "all" || filterStatus === getStatus(g.visa_expiry);

      const matchBranch =
        filterBranch === "all" || g.branch === filterBranch;

      return matchSearch && matchStatus && matchBranch;
    })
    .sort((a, b) => {
      if (sortMode === "soonest") {
        return new Date(a.visa_expiry) - new Date(b.visa_expiry);
      }
      return b.id - a.id; // newest
    });

  /* ================= STATS ================= */
  const stats = {
    expired: guests.filter((g) => getStatus(g.visa_expiry) === "expired").length,
    soon: guests.filter((g) => getStatus(g.visa_expiry) === "soon").length,
    valid: guests.filter((g) => getStatus(g.visa_expiry) === "valid").length,
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-8">Visa SaaS</h1>
        <p className="text-blue-600 font-semibold">Dashboard</p>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <input
            className="border px-4 py-2 rounded-xl w-1/2"
            placeholder="Search guest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            + Add Guest
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">
            <Card title="Expired" value={stats.expired} color="red" />
            <Card title="Soon" value={stats.soon} color="yellow" />
            <Card title="Valid" value={stats.valid} color="green" />
          </div>

          {/* FILTERS */}
          <div className="flex gap-3">
            <select
              className="border px-4 py-2 rounded-xl"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="expired">Expired</option>
              <option value="soon">Soon</option>
              <option value="valid">Valid</option>
            </select>

            <select
              className="border px-4 py-2 rounded-xl"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="soonest">Sắp hết hạn</option>
            </select>

            <select
              className="border px-4 py-2 rounded-xl"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              <option value="Nguyễn Trãi 19">Nguyễn Trãi 19</option>
              <option value="Nguyễn Trãi 27">Nguyễn Trãi 27</option>
              <option value="Lê Thị Riêng">Lê Thị Riêng</option>
              <option value="Võ Thị Sáu">Võ Thị Sáu</option>
              <option value="Trần Doãn Khanh">Trần Doãn Khanh</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">

              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-3">#</th>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th className="text-right p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((g, index) => (
                    <tr
                      key={g.id}
                      className={`border-t transition ${
                        newId === g.id ? "bg-green-100" : ""
                      }`}
                    >
                      <td className="p-3 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="font-semibold">{g.name}</td>
                      <td>{g.branch}</td>
                      <td>{formatDate(g.visa_expiry)}</td>
                      <td>
                        <StatusBadge status={getStatus(g.visa_expiry)} />
                      </td>

                      <td className="text-right p-3">
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl w-[500px] space-y-4"
          >
            <h2 className="text-xl font-bold">Add Guest</h2>

            <input
              name="name"
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="visa_expiry"
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />

            <select
              name="branch"
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            >
              <option value="">Select branch</option>
              <option value="Nguyễn Trãi 19">Nguyễn Trãi 19</option>
              <option value="Nguyễn Trãi 27">Nguyễn Trãi 27</option>
              <option value="Lê Thị Riêng">Lê Thị Riêng</option>
              <option value="Võ Thị Sáu">Võ Thị Sáu</option>
              <option value="Trần Doãn Khanh">Trần Doãn Khanh</option>
            </select>

            <input
              type="file"
              name="passport_image"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />

            <input
              type="file"
              name="visa_image"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />

            <div className="flex gap-3">
              <button className="bg-blue-600 text-white w-full py-2 rounded">
                Save
              </button>

              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="w-full bg-gray-200 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* CARD */
function Card({ title, value, color }) {
  const colors = {
    red: "text-red-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <p className="text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

/* BADGE */
function StatusBadge({ status }) {
  const map = {
    expired: "bg-red-100 text-red-600",
    soon: "bg-yellow-100 text-yellow-600",
    valid: "bg-green-100 text-green-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${map[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}