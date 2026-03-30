import chalk from 'chalk';
import ora from 'ora';
import { analyzeComplexity } from '../core/complexity.js';
import { suggestSplits } from '../core/splitter.js';
import { printTerminalReport } from '../report/terminalReport.js';
import { generateReport } from '../report/htmlReport.js';
import open from 'open';

/**
 * Run a demo with realistic sample data to showcase Incisio capabilities.
 * This simulates a Monster PR that touches database, API, UI, auth, and tests.
 */
export async function runDemo(generateHtml = false) {
  const spinner = ora({
    text: chalk.cyan('Loading demo data — simulating a real Monster PR...'),
    spinner: 'dots12'
  }).start();

  // Simulate a realistic Monster PR diff data
  const demoDiffData = generateDemoData();

  await sleep(800);
  spinner.text = chalk.cyan(`Scanning ${demoDiffData.files.length} changed files...`);
  await sleep(600);

  // Analyze complexity
  const complexityReport = analyzeComplexity(demoDiffData);

  spinner.text = chalk.cyan('Computing smart split suggestions...');
  await sleep(500);

  const splits = suggestSplits(complexityReport);

  spinner.succeed(chalk.green('Demo PR X-Ray scan complete!\n'));

  console.log(chalk.gray.italic('  ℹ️  This is a demo using simulated data. Run "incisio scan" in a real git repo for actual results.\n'));

  // Print terminal report
  printTerminalReport(complexityReport, splits, 150);

  // Generate HTML report if requested
  if (generateHtml) {
    const reportSpinner = ora({
      text: chalk.cyan('Generating X-Ray HTML report...'),
      spinner: 'dots12'
    }).start();

    const reportPath = await generateReport(complexityReport, splits);
    reportSpinner.succeed(chalk.green(`X-Ray report saved to: ${reportPath}`));
    await open(reportPath);
  }
}

function generateDemoData() {
  return {
    targetBranch: 'main',
    totalFiles: 18,
    totalInsertions: 847,
    totalDeletions: 234,
    totalChanges: 1081,
    files: [
      // Database layer
      {
        path: 'src/database/migrations/20260330_add_user_roles.sql',
        insertions: 45, deletions: 0, changes: 45, binary: false,
        extension: 'sql', directory: 'src/database/migrations',
        filename: '20260330_add_user_roles.sql',
        content: generateSQLContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/models/User.js',
        insertions: 78, deletions: 23, changes: 101, binary: false,
        extension: 'js', directory: 'src/models',
        filename: 'User.js',
        content: generateModelContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/models/Role.js',
        insertions: 52, deletions: 0, changes: 52, binary: false,
        extension: 'js', directory: 'src/models',
        filename: 'Role.js',
        content: generateRoleModelContent(),
        diffContent: null, imports: [],
      },
      // Auth layer
      {
        path: 'src/auth/middleware/rbac.js',
        insertions: 89, deletions: 12, changes: 101, binary: false,
        extension: 'js', directory: 'src/auth/middleware',
        filename: 'rbac.js',
        content: generateAuthMiddlewareContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/auth/strategies/jwt.js',
        insertions: 34, deletions: 8, changes: 42, binary: false,
        extension: 'js', directory: 'src/auth/strategies',
        filename: 'jwt.js',
        content: generateJWTContent(),
        diffContent: null, imports: [],
      },
      // API layer
      {
        path: 'src/routes/users.js',
        insertions: 67, deletions: 15, changes: 82, binary: false,
        extension: 'js', directory: 'src/routes',
        filename: 'users.js',
        content: generateRoutesContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/controllers/UserController.js',
        insertions: 112, deletions: 34, changes: 146, binary: false,
        extension: 'js', directory: 'src/controllers',
        filename: 'UserController.js',
        content: generateControllerContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/routes/admin.js',
        insertions: 43, deletions: 0, changes: 43, binary: false,
        extension: 'js', directory: 'src/routes',
        filename: 'admin.js',
        content: generateAdminRoutesContent(),
        diffContent: null, imports: [],
      },
      // UI layer
      {
        path: 'src/components/UserProfile.jsx',
        insertions: 89, deletions: 45, changes: 134, binary: false,
        extension: 'jsx', directory: 'src/components',
        filename: 'UserProfile.jsx',
        content: generateReactComponentContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/components/RoleSelector.jsx',
        insertions: 56, deletions: 0, changes: 56, binary: false,
        extension: 'jsx', directory: 'src/components',
        filename: 'RoleSelector.jsx',
        content: generateRoleSelectorContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/components/AdminPanel.jsx',
        insertions: 67, deletions: 12, changes: 79, binary: false,
        extension: 'jsx', directory: 'src/components',
        filename: 'AdminPanel.jsx',
        content: generateAdminPanelContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'src/pages/settings.jsx',
        insertions: 34, deletions: 8, changes: 42, binary: false,
        extension: 'jsx', directory: 'src/pages',
        filename: 'settings.jsx',
        content: generatePageContent(),
        diffContent: null, imports: [],
      },
      // Config
      {
        path: 'config/permissions.json',
        insertions: 23, deletions: 5, changes: 28, binary: false,
        extension: 'json', directory: 'config',
        filename: 'permissions.json',
        content: '{ "roles": { "admin": { "permissions": ["*"] } } }',
        diffContent: null, imports: [],
      },
      {
        path: '.env.example',
        insertions: 3, deletions: 1, changes: 4, binary: false,
        extension: 'env', directory: '.',
        filename: '.env.example',
        content: 'DATABASE_URL=postgres://localhost\nJWT_SECRET=change_me\nRBAC_ENABLED=true',
        diffContent: null, imports: [],
      },
      // Tests
      {
        path: 'tests/auth/rbac.test.js',
        insertions: 45, deletions: 0, changes: 45, binary: false,
        extension: 'js', directory: 'tests/auth',
        filename: 'rbac.test.js',
        content: generateTestContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'tests/controllers/UserController.test.js',
        insertions: 56, deletions: 23, changes: 79, binary: false,
        extension: 'js', directory: 'tests/controllers',
        filename: 'UserController.test.js',
        content: generateControllerTestContent(),
        diffContent: null, imports: [],
      },
      {
        path: 'tests/components/UserProfile.test.jsx',
        insertions: 34, deletions: 12, changes: 46, binary: false,
        extension: 'jsx', directory: 'tests/components',
        filename: 'UserProfile.test.jsx',
        content: generateComponentTestContent(),
        diffContent: null, imports: [],
      },
      // Infrastructure
      {
        path: '.github/workflows/ci.yml',
        insertions: 12, deletions: 4, changes: 16, binary: false,
        extension: 'yml', directory: '.github/workflows',
        filename: 'ci.yml',
        content: 'name: CI\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4',
        diffContent: null, imports: [],
      },
    ],
  };
}

// Content generators for realistic demo data
function generateSQLContent() {
  return `CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('editor', 'Can edit content'),
  ('viewer', 'Read-only access');

ALTER TABLE users ADD COLUMN last_role_change TIMESTAMP;`;
}

function generateModelContent() {
  return `import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  profile: {
    name: String,
    avatar: String,
  },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.hasRole = function(roleName) {
  if (this.roles && this.roles.length > 0) {
    for (const role of this.roles) {
      if (role.name === roleName) {
        return true;
      }
    }
  }
  return false;
};

UserSchema.methods.hasPermission = async function(permission) {
  await this.populate('roles');
  for (const role of this.roles) {
    if (role.permissions.includes('*') || role.permissions.includes(permission)) {
      return true;
    }
  }
  return false;
};

export default mongoose.model('User', UserSchema);`;
}

function generateRoleModelContent() {
  return `import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [String],
  isSystem: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

RoleSchema.statics.findByName = function(name) {
  return this.findOne({ name });
};

export default mongoose.model('Role', RoleSchema);`;
}

function generateAuthMiddlewareContent() {
  return `import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate('roles');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const hasRole = user.roles.some(r => roles.includes(r.name));
      if (!hasRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      req.userDoc = user;
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

export function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate('roles');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const hasPerm = await user.hasPermission(permission);
      if (!hasPerm) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}`;
}

function generateJWTContent() {
  return `import jwt from 'jsonwebtoken';

export function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}`;
}

function generateRoutesContent() {
  return `import express from 'express';
import { requireAuth, requireRole } from '../auth/middleware/rbac.js';
import UserController from '../controllers/UserController.js';

const router = express.Router();

router.get('/profile', requireAuth, UserController.getProfile);
router.put('/profile', requireAuth, UserController.updateProfile);
router.get('/roles', requireAuth, UserController.getRoles);
router.post('/roles/assign', requireAuth, requireRole('admin'), UserController.assignRole);
router.delete('/roles/revoke', requireAuth, requireRole('admin'), UserController.revokeRole);

export default router;`;
}

function generateControllerContent() {
  return `import User from '../models/User.js';
import Role from '../models/Role.js';

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).populate('roles');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { 'profile.name': name, 'profile.avatar': avatar },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async getRoles(req, res) {
    try {
      const user = await User.findById(req.user.id).populate('roles');
      res.json({ roles: user.roles });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  async assignRole(req, res) {
    try {
      const { userId, roleName } = req.body;
      const role = await Role.findByName(roleName);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.roles.includes(role._id)) {
        return res.status(400).json({ error: 'User already has this role' });
      }
      user.roles.push(role._id);
      await user.save();
      res.json({ message: 'Role assigned', user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }

  async revokeRole(req, res) {
    try {
      const { userId, roleName } = req.body;
      const role = await Role.findByName(roleName);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.roles = user.roles.filter(r => !r.equals(role._id));
      await user.save();
      res.json({ message: 'Role revoked', user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to revoke role' });
    }
  }
}

export default new UserController();`;
}

function generateAdminRoutesContent() {
  return `import express from 'express';
import { requireAuth, requireRole } from '../auth/middleware/rbac.js';

const router = express.Router();

router.get('/dashboard', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().populate('roles');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;`;
}

function generateReactComponentContent() {
  return `import React, { useState, useEffect } from 'react';
import { RoleSelector } from './RoleSelector';

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users/profile');
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (roleName) => {
    try {
      const res = await fetch('/api/users/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleName }),
      });
      if (res.ok) {
        fetchUser();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-profile">
      <h2>{user?.profile?.name || 'Unknown User'}</h2>
      <div className="roles">
        {user?.roles?.map(role => (
          <span key={role._id} className="role-badge">{role.name}</span>
        ))}
      </div>
      <RoleSelector
        currentRoles={user?.roles || []}
        onChange={handleRoleChange}
      />
    </div>
  );
}`;
}

function generateRoleSelectorContent() {
  return `import React, { useState, useEffect } from 'react';

export function RoleSelector({ currentRoles, onChange }) {
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => setAvailableRoles(data.roles));
  }, []);

  return (
    <div className="role-selector">
      <h3>Manage Roles</h3>
      {availableRoles.map(role => (
        <label key={role._id}>
          <input
            type="checkbox"
            checked={currentRoles.some(r => r._id === role._id)}
            onChange={() => onChange(role.name)}
          />
          {role.name}
        </label>
      ))}
    </div>
  );
}`;
}

function generateAdminPanelContent() {
  return `import React, { useState, useEffect } from 'react';

export function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/dashboard').then(r => r.json()),
    ]).then(([usersData, statsData]) => {
      setUsers(usersData.users || []);
      setStats(statsData);
    }).catch(console.error);
  }, []);

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>
      <div className="user-list">
        {users.map(user => (
          <div key={user._id} className="user-row">
            <span>{user.email}</span>
            <span>{user.roles?.map(r => r.name).join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

function generatePageContent() {
  return `import React from 'react';
import { UserProfile } from '../components/UserProfile';
import { AdminPanel } from '../components/AdminPanel';

export default function SettingsPage({ user }) {
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <UserProfile userId={user?.id} />
      {user?.isAdmin && <AdminPanel />}
    </div>
  );
}`;
}

function generateTestContent() {
  return `import { describe, it, expect, beforeEach } from 'jest';
import { requireAuth, requireRole, requirePermission } from '../../src/auth/middleware/rbac.js';

describe('RBAC Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, user: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('requireAuth', () => {
    it('should reject requests without token', () => {
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should accept valid tokens', () => {
      req.headers.authorization = 'Bearer valid_token';
      requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should reject users without required role', async () => {
      const middleware = requireRole('admin');
      req.user = { id: '123' };
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});`;
}

function generateControllerTestContent() {
  return `import { describe, it, expect, beforeEach, jest } from 'jest';
import UserController from '../../src/controllers/UserController.js';

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: '123' }, body: {} };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      await UserController.getProfile(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      req.user.id = 'nonexistent';
      await UserController.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      req.body = { userId: '456', roleName: 'editor' };
      await UserController.assignRole(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });
});`;
}

function generateComponentTestContent() {
  return `import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from '../../src/components/UserProfile';

describe('UserProfile', () => {
  it('should render loading state', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render user profile after loading', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { profile: { name: 'John' }, roles: [] } }),
    });

    render(<UserProfile userId="123" />);
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });
});`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
