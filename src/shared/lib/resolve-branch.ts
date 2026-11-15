import { prisma } from "@/shared/lib/prisma";

/**
 * Resolves a branch input string (which can be a branch code like "OCEAN_PARK",
 * "LANG_HA", or a CUID id) into the corresponding database Branch record.
 * Returns null if input is "ALL" or undefined.
 */
export async function resolveBranch(branchInput?: string | null) {
  if (!branchInput || branchInput === "ALL") {
    return null;
  }

  const branch = await prisma.branch.findFirst({
    where: {
      OR: [{ id: branchInput }, { code: branchInput }],
    },
  });

  return branch;
}
