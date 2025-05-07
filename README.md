# WhyGym App

A comprehensive gym management system built with NestJS.

## Quick Links
- [Project Roadmap](docs/ROADMAP.md)
- [Current Tasks](docs/tasks/TODO.md)
- [In Progress Tasks](docs/tasks/IN_PROGRESS.md)
- [Completed Tasks](docs/tasks/DONE.md)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Run the development server:
   ```bash
   npm run start:dev
   ```

## Documentation
For more detailed information about the project, please check the [docs](docs/) directory.

## Contributing
Please read our contributing guidelines before submitting pull requests.

# TODO List

- [ ] Build integration test using k6
- [ ] Verify payment status by calling api to check payment status based on invoice id returned after create invoice
- [ ] Capability to merging 2 registration into one if 'emailPic' the same, but have capabilities to exclude
- [ ] mechanism of rejecting expired membership
- [ ] extend membership 