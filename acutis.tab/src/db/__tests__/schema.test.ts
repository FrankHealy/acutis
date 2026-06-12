import { initializeSchema } from "../schema";
import { openEncryptedDatabase } from "../connection";

jest.mock("../connection", () => ({
  openEncryptedDatabase: jest.fn(),
  queryAll: jest.fn(),
}));

describe("initializeSchema", () => {
  it("creates offline tables for sync, roll call, admissions, and group therapy", async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    jest.mocked(openEncryptedDatabase).mockResolvedValue({ execAsync } as never);

    await initializeSchema();

    const schemaSql = execAsync.mock.calls[0][0] as string;
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS sync_queue");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS roll_call");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS admission_drafts");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS admission_sections");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS admission_signatures");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS admission_room_assignments");
    expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS group_therapy_sessions");
    expect(schemaSql).toContain("idx_admission_drafts_unit_status");
    expect(schemaSql).toContain("idx_group_therapy_sessions_unit_date");
  });
});
