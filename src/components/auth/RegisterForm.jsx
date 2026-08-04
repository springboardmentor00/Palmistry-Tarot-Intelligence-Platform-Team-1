import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      toast.success("Registration Successful");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4 py-8">

      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-8">

        <h2 className="text-3xl font-bold text-center text-violet-700">
          Register
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Create your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block mb-2 font-medium">
                First Name
              </label>

              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Last Name
              </label>

              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-3"
              />
            </div>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Username
            </label>

            <div className="relative">

              <FiUser className="absolute left-3 top-4 text-gray-500" />

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
                className="w-full border rounded-lg pl-10 py-3"
              />

            </div>

          </div>
          <div>

            <label className="block mb-2 font-medium">
              Email
            </label>

            <div className="relative">

              <FiMail className="absolute left-3 top-4 text-gray-500" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
                className="w-full border rounded-lg pl-10 py-3"
              />

            </div>

          </div>

          <div>
            <label className="block mb-2 font-medium">Account Type / Role</label>
            <select
              name="role"
              value={formData.role || "user"}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:border-violet-600 bg-white"
            >
              <option value="user">User (Client)</option>
              <option value="tarot_reader">Tarot Reader</option>
              <option value="spiritual_consultant">Spiritual Consultant</option>
            </select>
          </div>

          <div>

            <label className="block mb-2 font-medium">
              Password
            </label>

            <div className="relative">

              <FiLock className="absolute left-3 top-4 text-gray-500" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create Password"
                required
                className="w-full border rounded-lg pl-10 pr-10 py-3"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-gray-500"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>

            </div>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Confirm Password
            </label>

            <div className="relative">

              <FiLock className="absolute left-3 top-4 text-gray-500" />

              <input
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="w-full border rounded-lg pl-10 py-3"
              />

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-600 font-semibold"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default RegisterForm;
