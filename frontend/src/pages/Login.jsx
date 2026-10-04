import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { validateLogin } from "../utils/validators";
import { getErrorMessage, getFieldErrors } from "../utils/errors";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Log in");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname || "/";

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);

  if (isAuthenticated) return <Navigate to={dest} replace />;

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    const found = validateLogin(values);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    busy.current = true;
    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(dest, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="container narrow">
      <h1 className="page-title">Log in</h1>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert" role="alert">{formError}</div>}
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={values.email} onChange={setField("email")}
            aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} disabled={submitting} />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <input id="password" type="password" autoComplete="current-password" value={values.password} onChange={setField("password")}
            aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} disabled={submitting} />
        </Field>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="form-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
