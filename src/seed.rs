/// FNV-1a Hash Algorithm for deterministic seed conversion
/// Text seed → u64 for guaranteed cross-platform consistency

pub fn fnv1a_hash(input: &str) -> u64 {
    const FNV_OFFSET_BASIS: u64 = 0xcbf29ce484222325;
    const FNV_PRIME: u64 = 0x100000001b3;

    let mut hash = FNV_OFFSET_BASIS;
    for byte in input.as_bytes() {
        hash ^= *byte as u64;
        hash = hash.wrapping_mul(FNV_PRIME);
    }
    hash
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fnv1a_deterministic() {
        let seed1 = fnv1a_hash("xenus_settlement");
        let seed2 = fnv1a_hash("xenus_settlement");
        assert_eq!(seed1, seed2, "FNV-1a must be deterministic");
    }

    #[test]
    fn test_fnv1a_different_inputs() {
        let seed1 = fnv1a_hash("xenus");
        let seed2 = fnv1a_hash("xenus_");
        assert_ne!(seed1, seed2, "Different inputs must produce different hashes");
    }
}
