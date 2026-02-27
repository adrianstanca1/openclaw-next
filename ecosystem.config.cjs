module.exports = {
  apps: [{
    name: 'openclaw-next',
    script: './dist-cli/cli/index.js',
    args: 'start',
    cwd: '/var/www/openclaw-next',
    env: {
      NODE_ENV: 'production',
      PORT: '18789'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
