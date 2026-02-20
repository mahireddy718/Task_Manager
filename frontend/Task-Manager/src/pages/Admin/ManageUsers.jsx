import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import {
  LuMail,
  LuPhone,
  LuMapPin,
  LuTrash2,
  LuUserPlus,
} from "react-icons/lu";
import moment from "moment";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "member",
  });
  const [error, setError] = useState("");

  // Fetch All Users
  const getAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error("Error fetching users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Create User
  const handleCreateUser = async () => {
    setError("");

    // Validation
    if (!newUser.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!newUser.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!newUser.phone.trim()) {
      setError("Phone is required");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.USERS.CREATE_USER, newUser);
      toast.success("User created successfully");
      setNewUser({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "member",
      });
      setShowAddModal(false);
      getAllUsers();
    } catch (error) {
      console.error("Error creating user", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(userId));
      toast.success("User deleted successfully");
      getAllUsers();
    } catch (error) {
      console.error("Error deleting user", error);
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const roleClass =
      role === "admin"
        ? "bg-purple-100 text-purple-800 border border-purple-300"
        : "bg-blue-100 text-blue-800 border border-blue-300";
    return (
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${roleClass}`}>
        {role === "admin" ? "Admin" : "Member"}
      </span>
    );
  };

  return (
    <DashboardLayout activeMenu="Manage Users">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-medium">Manage Users</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            <LuUserPlus className="text-lg" /> Add User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading users...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="card p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {user.name}
                    </h3>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <LuMail className="text-lg text-primary" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary">
                    {user.email}
                  </a>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2">
                    <LuPhone className="text-lg text-primary" />
                    <a href={`tel:${user.phone}`} className="hover:text-primary">
                      {user.phone}
                    </a>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-center gap-2">
                    <LuMapPin className="text-lg text-primary" />
                    <span>{user.address}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Joined: {moment(user.createdAt).format("MMM DD, YYYY")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="flex-1 flex items-center justify-center gap-1 text-rose-500 hover:bg-rose-50 px-3 py-2 rounded border border-rose-200 transition"
                >
                  <LuTrash2 className="text-lg" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">
            {searchQuery ? "No users found matching your search" : "No users available"}
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="form-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  placeholder="Enter user email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="form-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="form-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Address</label>
                <input
                  type="text"
                  placeholder="Enter address (optional)"
                  value={newUser.address}
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                  className="form-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="form-input mt-1"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageUsers;