import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: email, 2: PIN, 3: new password
    const [formData, setFormData] = useState({
        email: "",
        forgotPasswordPin: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { sendForgotPasswordPin, verifyForgotPasswordPin, updatePassword } = useAuthStore();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateEmail = () => {
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Invalid email format");
            return false;
        }
        return true;
    };

    const validatePIN = () => {
        if (!formData.forgotPasswordPin.trim()) {
            toast.error("PIN is required");
            return false;
        }
        return true;
    };

    const validatePassword = () => {
        if (!formData.newPassword.trim()) {
            toast.error("New password is required");
            return false;
        }
        if (formData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return false;
        }
        const hasUppercase = /[A-Z]/.test(formData.newPassword);
        const hasLowercase = /[a-z]/.test(formData.newPassword);
        const hasNumber = /[0-9]/.test(formData.newPassword);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword);
        
        if (!(hasUppercase && hasLowercase && hasNumber && hasSymbol)) {
            toast.error("Password must include uppercase, lowercase, number, and symbol");
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSendPIN = async (e) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setIsLoading(true);
        try {
            await sendForgotPasswordPin(formData.email);
            toast.success("PIN sent to your email");
            setStep(2);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to send PIN. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyPIN = async (e) => {
        e.preventDefault();
        if (!validatePIN()) return;

        setIsLoading(true);
        try {
            await verifyForgotPasswordPin(formData.email, formData.forgotPasswordPin);
            toast.success("PIN verified successfully");
            setStep(3);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Invalid PIN. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setIsLoading(true);
        try {
            await updatePassword(formData.email, formData.newPassword);
            toast.success("Password updated successfully");
            navigate("/login");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update password. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-form">
                <div className="forgot-password-content">
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Lock className="size-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold mt-2">Reset Password</h1>
                            <p className="text-base-content/60">
                                {step === 1 && "Enter your email to receive a PIN"}
                                {step === 2 && "Enter the PIN sent to your email"}
                                {step === 3 && "Enter your new password"}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={step === 1 ? handleSendPIN : step === 2 ? handleVerifyPIN : handleUpdatePassword} className="space-y-6">
                        {step === 1 && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="size-5 text-base-content/40" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">PIN</span>
                                </label>
                                <input
                                    type="text"
                                    name="forgotPasswordPin"
                                    className="input"
                                    placeholder="Enter the PIN sent to your email"
                                    value={formData.forgotPasswordPin}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">New Password</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="size-5 text-base-content/40" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="newPassword"
                                            className="input"
                                            placeholder="••••••••"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-5 text-base-content/40" />
                                            ) : (
                                                <Eye className="size-5 text-base-content/40" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Confirm New Password</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="size-5 text-base-content/40" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            className="input"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    {step === 1 ? "Sending PIN..." : step === 2 ? "Verifying PIN..." : "Updating Password..."}
                                </>
                            ) : (
                                step === 1 ? "Send PIN" : step === 2 ? "Verify PIN" : "Update Password"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-base-content/60">
                            Remember your password?{" "}
                            <Link to="/login" className="link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;