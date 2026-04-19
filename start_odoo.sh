#!/bin/bash

# Change to project directory
cd /home/odoo19/odoo19 || exit 1

# Activate virtual environment
source venv/bin/activate

# Ensure PostgreSQL is running
if ! pg_isready -q; then
    echo "PostgreSQL is not running. Starting it now..."
    sudo service postgresql start
    sleep 2
fi

# Launch Odoo with console logging (overrides any logfile setting)
./odoo-bin -c odoo.conf --log-handler=:INFO "$@"
