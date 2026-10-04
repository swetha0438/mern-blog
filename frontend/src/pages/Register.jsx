import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { validateRegister } from "../utils/validators";
import { getErrorMessage, getFieldErrors } from "../utils/errors";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Register() {
  useDocumentTitle("Create account");
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    const found = validateRegister(values);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    busy.current = true;
    setSubmitting(true);
    try {
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  const input = (name, label, type, autoComplete) => (
    <Field id={name} label={label} error={errors[name]}>
      <input id={name} type={type} autoComplete={autoComplete} value={values[name]} onChange={setField(name)}
        aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} disabled={submitting} />
    </Field>
  );

  return (
    <div className="container narrow">
      <h1 className="page-title">Create your account</h1>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert" role="alert">{formError}</div>}
        {input("username", "Username", "text", "username")}
        {input("email", "Email", "email", "email")}
        {input("password", "Password", "password", "new-password")}
        {input("confirmPassword", "Confirm password", "password", "new-password")}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="form-switch">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
