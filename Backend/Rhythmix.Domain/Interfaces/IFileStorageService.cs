// Rhythmix.Domain/Interfaces/IFileStorageService.cs
namespace Rhythmix.Domain.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Lưu file lên disk
    /// </summary>
    /// <param name="fileStream">Stream của file</param>
    /// <param name="fileName">Tên file gốc</param>
    /// <param name="subDirectory">Thư mục con (audio/video)</param>
    /// <returns>Đường dẫn tương đối của file đã lưu</returns>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string subDirectory = "media");
    
    /// <summary>
    /// Lấy stream của file để đọc
    /// </summary>
    /// <param name="filePath">Đường dẫn file</param>
    /// <returns>Stream của file</returns>
    Task<Stream?> GetFileStreamAsync(string filePath);
    
    /// <summary>
    /// Xóa file khỏi disk
    /// </summary>
    /// <param name="filePath">Đường dẫn file</param>
    /// <returns>True nếu xóa thành công</returns>
    Task<bool> DeleteFileAsync(string filePath);
    
    /// <summary>
    /// Lấy Content-Type dựa trên tên file
    /// </summary>
    string GetContentType(string fileName);
    
    /// <summary>
    /// Kiểm tra file có phải media hợp lệ không
    /// </summary>
    /// <param name="fileName">Tên file</param>
    /// <param name="contentType">Content-Type</param>
    /// <param name="mediaType">Loại media (audio/video)</param>
    /// <returns>True nếu hợp lệ</returns>
    bool IsValidMediaFile(string fileName, string contentType, out string mediaType);
}