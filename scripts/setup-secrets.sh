#!/bin/bash

# Create secrets directory if it doesn't exist
mkdir -p secrets

# Function to prompt for secret value
prompt_secret() {
    local secret_name=$1
    local secret_file="secrets/${secret_name}.txt"
    
    # Check if secret file already exists
    if [ -f "$secret_file" ]; then
        read -p "Secret $secret_name already exists. Do you want to overwrite it? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    # Prompt for secret value
    read -sp "Enter $secret_name: " secret_value
    echo
    
    # Save secret to file
    echo -n "$secret_value" > "$secret_file"
    chmod 600 "$secret_file"
    echo "Secret $secret_name has been saved."
}

# Function to generate random secret
generate_secret() {
    local secret_name=$1
    local secret_file="secrets/${secret_name}.txt"
    
    # Check if secret file already exists
    if [ -f "$secret_file" ]; then
        read -p "Secret $secret_name already exists. Do you want to regenerate it? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    # Generate random secret
    secret_value=$(openssl rand -base64 32)
    
    # Save secret to file
    echo -n "$secret_value" > "$secret_file"
    chmod 600 "$secret_file"
    echo "Secret $secret_name has been generated and saved."
}

echo "Setting up secrets for Osprey Labs application..."
echo

# Prompt for each secret
prompt_secret "openai_api_key"

# Generate NextAuth secret automatically
generate_secret "nextauth_secret"

echo
echo "All secrets have been set up."
echo
echo "Next steps:"
echo "1. Copy env.template to .env.local and .env.production"
echo "2. Update the environment files with your specific values"
echo "3. For production deployment, set environment variables in your hosting platform" 