module.exports = {
  apps: [{
    name: 'sms-backend',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      FRONTEND_URL: 'https://strong-kangaroo-e849ac.netlify.app',
      DLR_CALLBACK_URL: 'https://api.shenyukeji.cc/api/dlr',
      MO_CALLBACK_URL: 'https://api.shenyukeji.cc/api/mo'
    }
  }]
};