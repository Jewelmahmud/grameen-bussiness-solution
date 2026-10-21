const SecurityUtils = require('../src/utils/security');

describe('SecurityUtils.isValidUUID', () => {
  it('accepts lowercase v4-style UUIDs', () => {
    expect(SecurityUtils.isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('accepts uppercase', () => {
    expect(SecurityUtils.isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('rejects invalid strings', () => {
    expect(SecurityUtils.isValidUUID('')).toBe(false);
    expect(SecurityUtils.isValidUUID('not-a-uuid')).toBe(false);
    expect(SecurityUtils.isValidUUID(null)).toBe(false);
    expect(SecurityUtils.isValidUUID(123)).toBe(false);
  });
});
