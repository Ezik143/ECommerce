import { useAuth } from '../hooks/useAuth0';

const LoginButton = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        className="btn btn-ghost btn-sm"
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="btn btn-primary btn-sm"
    >
      Login / Sign Up
    </button>
  );
};

export default LoginButton;