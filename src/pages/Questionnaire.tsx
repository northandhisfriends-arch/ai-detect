// ... ใน renderPart1()
<SelectTrigger id="gender-select" className="flex items-center">
    {/* Display selected value with icon in the trigger */}
    {formData.gender === "Male" && <img src={maleIcon} alt="Male Icon" className="w-5 h-5 mr-2" />}
    {formData.gender === "Female" && <img src={femaleIcon} alt="Female Icon" className="w-5 h-5 mr-2" />}
    <SelectValue placeholder="Select gender (Required)" />
</SelectTrigger>
<SelectContent>
    <SelectItem value="Male">
        <div className="flex items-center">
            <img src={maleIcon} alt="Male Icon" className="w-5 h-5 mr-2" />
            <span>Male</span>
        </div>
    </SelectItem>
    <SelectItem value="Female">
        <div className="flex items-center">
            <img src={femaleIcon} alt="Female Icon" className="w-5 h-5 mr-2" />
            <span>Female</span>
        </div>
    </SelectItem>
</SelectContent>
