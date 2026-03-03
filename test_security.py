from core.security import get_password_hash, verify_password, encrypt_data, decrypt_data

def test_security():
    # 1. 비밀번호 테스트
    password = "my_secret_password"
    hashed = get_password_hash(password)
    print(f"Password: {password}")
    print(f"Hashed: {hashed}")
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False
    print("Password test passed!")

    # 2. 데이터 암호화 테스트
    original_data = "010-1234-5678"
    encrypted = encrypt_data(original_data)
    decrypted = decrypt_data(encrypted)
    print(f"\nOriginal: {original_data}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
    assert original_data == decrypted
    print("Data encryption test passed!")

if __name__ == "__main__":
    try:
        test_security()
        print("\nAll security tests passed successfully!")
    except Exception as e:
        print(f"\nTest failed: {e}")
