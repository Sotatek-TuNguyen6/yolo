import { getUserFromToken } from '../../utils/auth';

export default async function AdminPage() {
  const user = await getUserFromToken();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-800 mb-2">User Information</h3>
        <div className="space-y-2">
          <p>
            <span className="text-gray-600">Role:</span> {user?.role}
          </p>
          {user &&
            Object.entries(user)
              .filter(([key]) => !['exp', 'iat', 'role'].includes(key))
              .map(([key, value]) => (
                <p key={key}>
                  <span className="text-gray-600">{key}:</span> {value as string}
                </p>
              ))}
        </div>
      </div>
    </div>
  );
}
