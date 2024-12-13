'use client';

import { useState, useEffect } from 'react';

import { getUser, changePassword } from '@/api/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { useSession } from '@/context/useSession';
import { Role, type User } from '@/types/user';

const ProfilePage = () => {
  const { sessionData } = useSession();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!sessionData) return;
        const response = await getUser(sessionData.user.id, sessionData.accessToken);
        setUser(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      }
    };

    fetchUser();
  }, [sessionData]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (!sessionData) {
        throw new Error('User not authenticated');
      }

      const user = await getUser(sessionData.user.id, sessionData.accessToken);
      setUser(user.data);

      await changePassword(user.data.id, newPassword, sessionData.accessToken);

      setSuccess('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Username</h2>
            <p className="text-gray-600 dark:text-gray-300">{user?.username}</p>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">{success}</p>}
                <Button type="submit">Change Password</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ProfilePage.authenticationEnabled = {
  role: Role.USER,
};

export default ProfilePage;
