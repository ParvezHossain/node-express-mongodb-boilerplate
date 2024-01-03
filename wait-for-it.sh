#!/bin/bash
# wait-for-it.sh
# Script to wait for a service to be ready before executing a command

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

function wait_for {
    until nc -z "$host" "$port"; do
        echo "Waiting for $host:$port..."
        sleep 1
    done
}

if [ "$host" = "" ] || [ "$port" = "" ]; then
    echo "Usage: $0 <host> <port> [command...]"
    exit 1
fi

wait_for
echo "Service is up! Executing command: $cmd"
exec $cmd
