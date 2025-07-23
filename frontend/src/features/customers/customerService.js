export async function fetchCustomers() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`);
  if (!response.ok) throw new Error("Failed to fetch customers");
  return response.json();
}
