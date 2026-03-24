'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function SignupPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call backend signup API
      const response = await authApi.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Save token to localStorage
      localStorage.setItem('token', response.access_token);

      // Redirect to map
      router.push('/map-user');
      
    } catch (err: any) {
      // Handle errors
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              margin: 0,
              color: "#b9853f",
              fontSize: "14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Get started
          </p>

          <h2
            style={{
              margin: "10px 0 0 0",
              fontSize: "44px",
              lineHeight: 1.08,
              fontWeight: 500,
              color: "#4b2e22",
            }}
          >
            Create your account
          </h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          {/* USERNAME */}
          <div>
            <label htmlFor="name" style={labelStyle}>
              Username
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="ankit123"
              value={formData.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ankit@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{
              width: '100%',
              marginTop: '8px',
              fontSize: '18px',
              padding: '15px 20px',
              borderRadius: '14px',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p
          style={{
            marginTop: "22px",
            fontSize: "15px",
            color: "#6e5b50",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            style={{
              color: "#b9853f",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Log in
          </Link>
        </p>
    </div>
  );
}

/* STYLES */
const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "15px",
  color: "#6a584d",
  fontFamily: "Arial, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #ded7cc",
  background: "#fff",
  fontSize: "16px",
  outline: "none",
  fontFamily: "Arial, sans-serif",
  color: "#4b2e22",
  boxSizing: "border-box",
};

