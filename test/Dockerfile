FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Install Playwright browsers
RUN bunx playwright install --with-deps

CMD ["bun", "run", "test"]

