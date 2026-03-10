import { useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import "./emi-calculator.css";

function formatNumber(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString();
}

export default function EmiCalculatorPage() {
  const [form, setForm] = useState({
    amount: "",
    rate: "",
    tenure: "",
    tenureUnit: "years",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const computed = useMemo(() => {
    const principal = Number(form.amount);
    const annualRate = Number(form.rate);
    const tenureValue = Number(form.tenure);
    if (!Number.isFinite(principal) || principal <= 0) return null;
    if (!Number.isFinite(annualRate) || annualRate <= 0) return null;
    if (!Number.isFinite(tenureValue) || tenureValue <= 0) return null;

    const months = form.tenureUnit === "months" ? tenureValue : tenureValue * 12;
    const monthlyRate = annualRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, months);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      emi,
      totalPayment,
      totalInterest,
      months,
    };
  }, [form.amount, form.rate, form.tenure, form.tenureUnit]);

  return (
    <div className="emi-page">
      <Navbar showProfile />

      <section className="emi-hero">
        <div>
          <span className="eyebrow">EMI CALCULATOR</span>
          <h1>Estimate Your Monthly EMI</h1>
          <p>Quickly calculate your monthly instalment for a property loan.</p>
        </div>
      </section>

      <section className="emi-grid">
        <div className="emi-card">
          <h2>Loan Details</h2>
          <form className="emi-form">
            <label htmlFor="amount">Loan Amount (NPR)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              placeholder="e.g. 5000000"
              value={form.amount}
              onChange={handleChange}
              min="0"
            />

            <label htmlFor="rate">Interest Rate (% per annum)</label>
            <input
              id="rate"
              name="rate"
              type="number"
              placeholder="e.g. 9.5"
              value={form.rate}
              onChange={handleChange}
              min="0"
              step="0.01"
            />

            <label htmlFor="tenure">Loan Tenure</label>
            <div className="tenure-row">
              <input
                id="tenure"
                name="tenure"
                type="number"
                placeholder="e.g. 20"
                value={form.tenure}
                onChange={handleChange}
                min="0"
              />
              <select
                name="tenureUnit"
                value={form.tenureUnit}
                onChange={handleChange}
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </form>
        </div>

        <div className="emi-card highlight">
          <h2>Estimated EMI</h2>
          {computed ? (
            <div className="emi-results">
              <div className="result-row">
                <span>Monthly EMI</span>
                <strong>NPR {formatNumber(Math.round(computed.emi))}</strong>
              </div>
              <div className="result-row">
                <span>Total Interest</span>
                <strong>NPR {formatNumber(Math.round(computed.totalInterest))}</strong>
              </div>
              <div className="result-row">
                <span>Total Payment</span>
                <strong>NPR {formatNumber(Math.round(computed.totalPayment))}</strong>
              </div>
              <p className="result-note">
                Based on {computed.months} months tenure and {form.rate}% annual rate.
              </p>
            </div>
          ) : (
            <p className="result-placeholder">
              Enter loan amount, rate, and tenure to view your EMI.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
