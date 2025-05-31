import * as fs from 'fs';
import * as path from 'path';
import { expect } from '@playwright/test';

export class ApprovalHelper {
  private readonly approvalsDir: string;
  private readonly receivedDir: string;

  constructor(testName: string) {
    // Create approval directories relative to the test file
    const testDir = path.dirname(require.main?.filename || '');
    this.approvalsDir = path.join(testDir, 'approvals', testName);
    this.receivedDir = path.join(testDir, 'received', testName);

    // Ensure directories exist
    fs.mkdirSync(this.approvalsDir, { recursive: true });
    fs.mkdirSync(this.receivedDir, { recursive: true });
  }

  /**
   * Verify JSON data against an approved snapshot
   * @param data The data to verify
   * @param snapshotName Name of the snapshot file (without extension)
   */
  async verifyJson(data: unknown, snapshotName: string): Promise<void> {
    const receivedPath = path.join(this.receivedDir, `${snapshotName}.json`);
    const approvedPath = path.join(this.approvalsDir, `${snapshotName}.json`);

    // Write received data
    const receivedData = JSON.stringify(data, null, 2);
    fs.writeFileSync(receivedPath, receivedData);

    // Check if approved file exists
    if (!fs.existsSync(approvedPath)) {
      console.log(`\nNo approved snapshot found for ${snapshotName}`);
      console.log(`To approve this snapshot, run:`);
      console.log(`cp "${receivedPath}" "${approvedPath}"\n`);
      throw new Error(`No approved snapshot found for ${snapshotName}`);
    }

    // Compare with approved data
    const approvedData = fs.readFileSync(approvedPath, 'utf-8');
    expect(receivedData).toBe(approvedData);
  }

  /**
   * Verify HTML content against an approved snapshot
   * @param html The HTML content to verify
   * @param snapshotName Name of the snapshot file (without extension)
   */
  async verifyHtml(html: string, snapshotName: string): Promise<void> {
    const receivedPath = path.join(this.receivedDir, `${snapshotName}.html`);
    const approvedPath = path.join(this.approvalsDir, `${snapshotName}.html`);

    // Write received HTML
    fs.writeFileSync(receivedPath, html);

    // Check if approved file exists
    if (!fs.existsSync(approvedPath)) {
      console.log(`\nNo approved HTML snapshot found for ${snapshotName}`);
      console.log(`To approve this snapshot, run:`);
      console.log(`cp "${receivedPath}" "${approvedPath}"\n`);
      throw new Error(`No approved HTML snapshot found for ${snapshotName}`);
    }

    // Compare with approved HTML
    const approvedHtml = fs.readFileSync(approvedPath, 'utf-8');
    expect(html).toBe(approvedHtml);
  }

  /**
   * Get instructions for approving a snapshot
   * @param snapshotName Name of the snapshot file (without extension)
   * @param type Type of snapshot ('json' or 'html')
   */
  getApprovalInstructions(snapshotName: string, type: 'json' | 'html'): string {
    const receivedPath = path.join(this.receivedDir, `${snapshotName}.${type}`);
    const approvedPath = path.join(this.approvalsDir, `${snapshotName}.${type}`);
    return `To approve this ${type} snapshot, run:\ncp "${receivedPath}" "${approvedPath}"`;
  }
} 