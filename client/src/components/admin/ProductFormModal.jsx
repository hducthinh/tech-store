import React from "react";
import { Plus, X, Check, Edit, Trash2, Link, Loader2 } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";

export default function ProductFormModal({
  isModalOpen,
  editingId,
  formData,
  setFormData,
  categories,
  brands,
  formError,
  isSubmitting,
  handleSubmit,
  handleCloseModal,
  isAddingCategory,
  setIsAddingCategory,
  newCategoryName,
  setNewCategoryName,
  handleSaveNewCategory,
  isAddingBrand,
  setIsAddingBrand,
  newBrandName,
  setNewBrandName,
  handleSaveNewBrand,
  handleChange,
  thumbnailFile,
  setThumbnailFile,
  currentThumbnail,
  setCurrentThumbnail,
  imageFiles,
  setImageFiles,
  currentImages,
  handleEditExistingImage,
  handleRemoveImage,
}) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h3 className="text-lg font-bold text-slate-800">{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h3>
          <button type="button" onClick={handleCloseModal} className="text-slate-500 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{formError}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên sản phẩm *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="VD: Server Dell R740..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-700">Danh mục *</label>
                {!isAddingCategory && (
                  <button type="button" onClick={() => setIsAddingCategory(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Thêm mới
                  </button>
                )}
              </div>
              {isAddingCategory ? (
                <div className="flex items-center gap-2">
                  <input type="text" autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="Tên danh mục..." />
                  <button type="button" onClick={handleSaveNewCategory} className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition" title="Lưu">
                    <Check className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition" title="Hủy">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white">
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-700">Thương hiệu *</label>
                {!isAddingBrand && (
                  <button type="button" onClick={() => setIsAddingBrand(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Thêm mới
                  </button>
                )}
              </div>
              {isAddingBrand ? (
                <div className="flex items-center gap-2">
                  <input type="text" autoFocus value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="Tên thương hiệu..." />
                  <button type="button" onClick={handleSaveNewBrand} className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition" title="Lưu">
                    <Check className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setIsAddingBrand(false)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition" title="Hủy">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <select name="brandId" required value={formData.brandId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white">
                  <option value="" disabled>-- Chọn thương hiệu --</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Giá bán (VND) *</label>
              <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số lượng kho *</label>
              <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả tóm tắt</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="Mô tả thông số cơ bản..."></textarea>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Thông số kỹ thuật (Tùy chọn)</label>
              <button type="button" onClick={() => setFormData({...formData, specs: [...(formData.specs || []), {key: '', value: ''}]})} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer">
                <Plus className="w-3 h-3" /> Thêm thông số
              </button>
            </div>
            {formData.specs && formData.specs.length > 0 && (
              <div className="space-y-2 mb-2">
                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input type="text" placeholder="Tên (VD: Socket)" value={spec.key} onChange={(e) => {
                      const newSpecs = [...formData.specs];
                      newSpecs[index].key = e.target.value;
                      setFormData({...formData, specs: newSpecs});
                    }} className="w-1/2 px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-amber-500 outline-none text-sm" />
                    <input type="text" placeholder="Giá trị (VD: LGA1700)" value={spec.value} onChange={(e) => {
                      const newSpecs = [...formData.specs];
                      newSpecs[index].value = e.target.value;
                      setFormData({...formData, specs: newSpecs});
                    }} className="w-1/2 px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-amber-500 outline-none text-sm" />
                    <button type="button" onClick={() => {
                      const newSpecs = formData.specs.filter((_, i) => i !== index);
                      setFormData({...formData, specs: newSpecs});
                    }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh đại diện (1 ảnh)</label>
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 mb-2" />
              {currentThumbnail && !thumbnailFile && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  <a href={getImageUrl(currentThumbnail)} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mb-2 w-max" title={currentThumbnail}>
                    <Link className="w-3 h-3" /> Đường dẫn ảnh
                  </a>
                  <div className="relative group w-32 h-32">
                    <img src={getImageUrl(currentThumbnail)} alt="Thumbnail" className="h-full w-full object-contain rounded border border-slate-200 bg-white" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center gap-2">
                      <button type="button" onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.onchange = (e) => setThumbnailFile(e.target.files[0]);
                        fileInput.click();
                      }} className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-sm" title="Thay đổi ảnh"><Edit className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setCurrentThumbnail("")} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm" title="Xóa ảnh"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )}
              {thumbnailFile && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-600 mb-2 font-medium">Ảnh mới sẽ được cập nhật.</p>
                  <div className="relative group w-32 h-32 mt-2">
                    <img src={URL.createObjectURL(thumbnailFile)} alt="New Thumbnail" className="h-full w-full object-contain rounded border border-amber-200 bg-white" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center gap-2">
                      <button type="button" onClick={() => setThumbnailFile(null)} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm" title="Bỏ chọn ảnh"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh phụ (Tối đa 5 ảnh)</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(prev => [...prev, ...Array.from(e.target.files).slice(0, 5)])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 mb-2" />
              {currentImages.length > 0 && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">Đang có {currentImages.length} ảnh (Bạn có thể xóa hoặc thay đổi):</p>
                  <div className="flex gap-2 flex-wrap">
                    {currentImages.map((img, i) => (
                       <div key={i} className="relative group w-20 h-20 bg-white rounded border border-slate-200 flex items-center justify-center">
                          <img src={getImageUrl(img)} alt={`Img ${i}`} className="max-h-full max-w-full object-contain" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex flex-col items-center justify-center gap-1">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => handleEditExistingImage(i)} className="p-1 bg-white text-blue-600 rounded-full hover:bg-blue-50" title="Thay đổi"><Edit className="w-3 h-3" /></button>
                              <button type="button" onClick={() => handleRemoveImage(i)} className="p-1 bg-white text-red-600 rounded-full hover:bg-red-50" title="Xóa"><Trash2 className="w-3 h-3" /></button>
                            </div>
                            <a href={getImageUrl(img)} target="_blank" rel="noreferrer" className="p-1 bg-white text-slate-600 rounded-full hover:text-blue-600" title={img}>
                              <Link className="w-3 h-3" />
                            </a>
                          </div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
              {imageFiles.length > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-600 mb-2 font-medium">Các ảnh mới sẽ được cập nhật ({imageFiles.length}):</p>
                  <div className="flex gap-2 flex-wrap">
                    {imageFiles.map((file, i) => (
                      <div key={i} className="relative group w-20 h-20 bg-white rounded border border-amber-200 flex items-center justify-center">
                        <img src={URL.createObjectURL(file)} alt={`New Img ${i}`} className="max-h-full max-w-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center">
                          <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm" title="Xóa ảnh mới"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">Hủy bỏ</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
